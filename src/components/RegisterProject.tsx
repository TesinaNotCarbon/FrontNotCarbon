import React, { useEffect, useMemo, useRef, useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'
import { projectManagerAbi } from '../../contracts'
import { toast } from "react-toastify";
import LoadingOverlay from './LoadingOverlay'
import { Link } from "react-router-dom";
import {
    ArrowLeft,
    TreePine,
    Leaf,
    FileText,
    MapPinned,
    ListOrdered,
    Upload,
    Plus,
    Trash2,
} from "lucide-react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import '@geoman-io/leaflet-geoman-free';
import {
    type Coordinate,
    MAX_POLYGON_POINTS,
    normalizeCoordinates,
    toGeoJsonPolygon,
    validateCoordinates,
    extractCoordinatesFromGeoJson,
} from '../lib/geojson';
import {
    postProjectGeometryMock,
    type GeometrySourceTab,
} from '../services/projectGeometryMock';

type GeometryTab = 'map' | 'inputs' | 'upload';

const MAP_CENTER: [number, number] = [-34.6037, -58.3816];

function extractPolygonCoordinates(layer: L.Polygon): Coordinate[] {
    const latLngGroups = layer.getLatLngs() as L.LatLng[][];
    const latLngs = latLngGroups[0] || [];
    return latLngs.map((point) => ({ lat: point.lat, lng: point.lng }));
}

function MapPolygonEditor({
    coordinates,
    onCoordinatesChange,
    isActive,
}: {
    coordinates: Coordinate[];
    onCoordinatesChange: (next: Coordinate[]) => void;
    isActive: boolean;
}) {
    const map = useMap();
    const polygonLayerRef = useRef<L.Polygon | null>(null);
    const coordinatesRef = useRef<Coordinate[]>(coordinates);
    const invalidMapCoordinatesToastShownRef = useRef(false);

    useEffect(() => {
        coordinatesRef.current = normalizeCoordinates(coordinates);
    }, [coordinates]);

    useEffect(() => {
        if (isActive) {
            map.invalidateSize();
        }
    }, [isActive, map]);

    useEffect(() => {
        const mapAny = map as unknown as {
            pm?: {
                addControls: (options: Record<string, unknown>) => void;
                setGlobalOptions: (options: Record<string, unknown>) => void;
            };
        };

        if (mapAny.pm) {
            mapAny.pm.addControls({
                position: 'topleft',
                drawCircle: false,
                drawMarker: false,
                drawPolyline: false,
                drawRectangle: false,
                drawCircleMarker: false,
                drawText: false,
                drawPolygon: true,
                editMode: true,
                dragMode: false,
                cutPolygon: false,
                removalMode: true,
                rotateMode: false,
            });

            mapAny.pm.setGlobalOptions({
                continueDrawing: false,
                allowSelfIntersection: false,
            });
        }

        const handleCreate = (event: { layer?: unknown }) => {
            const layer = event.layer;
            if (!(layer instanceof L.Polygon)) {
                return;
            }

            const next = normalizeCoordinates(extractPolygonCoordinates(layer));
            const validation = validateCoordinates(next);

            if (!validation.valid) {
                toast.error(validation.error || 'Invalid polygon.');
                map.removeLayer(layer);
                return;
            }

            if (polygonLayerRef.current) {
                map.removeLayer(polygonLayerRef.current);
            }

            polygonLayerRef.current = layer;
            onCoordinatesChange(next);
        };

        const handleEdit = () => {
            if (!polygonLayerRef.current) {
                return;
            }

            const next = normalizeCoordinates(extractPolygonCoordinates(polygonLayerRef.current));
            const validation = validateCoordinates(next);

            if (!validation.valid) {
                toast.error(validation.error || 'Invalid polygon after edit.');
                if (coordinatesRef.current.length >= 3) {
                    polygonLayerRef.current.setLatLngs([
                        coordinatesRef.current.map((coord) => L.latLng(coord.lat, coord.lng)),
                    ]);
                }
                return;
            }

            onCoordinatesChange(next);
        };

        const handleRemove = (event: { layer?: unknown }) => {
            if (event.layer && polygonLayerRef.current && event.layer === polygonLayerRef.current) {
                polygonLayerRef.current = null;
                onCoordinatesChange([]);
            }
        };

        map.on('pm:create', handleCreate);
        map.on('pm:edit', handleEdit);
        map.on('pm:remove', handleRemove);

        return () => {
            map.off('pm:create', handleCreate);
            map.off('pm:edit', handleEdit);
            map.off('pm:remove', handleRemove);
        };
    }, [map, onCoordinatesChange]);

    useEffect(() => {
        const normalizedCoordinates = normalizeCoordinates(coordinates);
        const hasInvalidCoordinates = normalizedCoordinates.length !== coordinates.length;
        const hasOnlyPlaceholders = normalizedCoordinates.length === 0;

        if (hasInvalidCoordinates) {
            if (polygonLayerRef.current) {
                map.removeLayer(polygonLayerRef.current);
                polygonLayerRef.current = null;
            }

            if (isActive && !hasOnlyPlaceholders && !invalidMapCoordinatesToastShownRef.current) {
                toast.error('Some coordinates are incomplete or invalid. Complete them before drawing on the map.');
                invalidMapCoordinatesToastShownRef.current = true;
            }

            if (hasOnlyPlaceholders) {
                invalidMapCoordinatesToastShownRef.current = false;
            }
            return;
        }

        invalidMapCoordinatesToastShownRef.current = false;

        if (normalizedCoordinates.length < 3) {
            if (polygonLayerRef.current) {
                map.removeLayer(polygonLayerRef.current);
                polygonLayerRef.current = null;
            }
            return;
        }

        const latLngs = normalizedCoordinates.map((coord) => [coord.lat, coord.lng] as [number, number]);

        if (!polygonLayerRef.current) {
            const layer = L.polygon(latLngs, {
                color: '#16a34a',
                weight: 3,
            }).addTo(map);
            polygonLayerRef.current = layer;
            map.fitBounds(layer.getBounds(), { padding: [20, 20] });
            return;
        }

        polygonLayerRef.current.setLatLngs([latLngs]);
    }, [coordinates, isActive, map]);

    return null;
}

export function RegisterProject() {
    const { address } = useAccount()
    const { data: hash, isPending, writeContract } = useWriteContract()
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        totalTokens: ''
    })
    const [activeTab, setActiveTab] = useState<GeometryTab>('map')
    const [coordinates, setCoordinates] = useState<Coordinate[]>([])
    const [isUploadingGeometry, setIsUploadingGeometry] = useState(false)
    const validCoordinates = useMemo(() => normalizeCoordinates(coordinates), [coordinates])

    const { isLoading: isWaitingForReceipt, isSuccess: isReceiptSuccess } = useWaitForTransactionReceipt({
        hash,
    })

    useEffect(() => {
        if (isReceiptSuccess) {
            toast.success('Project registered successfully!', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            setFormData({
                name: '',
                description: '',
                totalTokens: ''
            })
        }
    }, [isReceiptSuccess]);

    async function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        if (!address) {
            toast.error('Please connect your wallet first')
            return
        }

        const formDataObj = new FormData(event.currentTarget)
        const name = formDataObj.get('name') as string
        const description = formDataObj.get('description') as string
        const totalTokens = formDataObj.get('totalTokens') as string

        if (!name || !description || !totalTokens) {
            toast.error('Please fill in all fields')
            return
        }

        const geometryUploaded = await handleUploadProjectGeometry(name, description)
        if (!geometryUploaded) {
            return
        }

        try {
            const result = writeContract({
                ...projectManagerAbi,
                functionName: 'registerProject',
                args: [name, description, import.meta.env.VITE_CARBON_CREDIT_CONTRACT_ADDRESS as `0x${string}`, BigInt(totalTokens)],
            })
            console.log('Transaction initiated:', result)
            toast.info('Transaction submitted, please wait for confirmation...')
        } catch (error) {
            console.error('Error registering project:', error)
            toast.error('Error registering project')
        }
    }

    const geometryValidation = useMemo(() => validateCoordinates(validCoordinates), [validCoordinates])

    const geoJsonPreview = useMemo(() => {
        if (!geometryValidation.valid) {
            return null
        }

        try {
            return JSON.stringify(toGeoJsonPolygon(validCoordinates), null, 2)
        } catch {
            return null
        }
    }, [validCoordinates, geometryValidation.valid])

    const isLoading = isPending || isWaitingForReceipt || isUploadingGeometry

    const loadingText = isUploadingGeometry
        ? 'Uploading project geometry...'
        : 'Registering Project...'

    function addCoordinate() {
        if (coordinates.length >= MAX_POLYGON_POINTS) {
            toast.error(`You can only add up to ${MAX_POLYGON_POINTS} coordinates.`)
            return
        }

        setCoordinates((prev) => [...prev, { lat: Number.NaN, lng: Number.NaN }])
    }

    function updateCoordinate(index: number, key: 'lat' | 'lng', value: string) {
        setCoordinates((prev) =>
            prev.map((coord, coordIndex) => {
                if (coordIndex !== index) {
                    return coord
                }

                return {
                    ...coord,
                    [key]: value === '' ? Number.NaN : Number(value),
                }
            })
        )
    }

    function removeCoordinate(index: number) {
        setCoordinates((prev) => prev.filter((_, coordIndex) => coordIndex !== index))
    }

    async function handleGeoJsonUpload(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0]
        if (!file) {
            return
        }

        try {
            const fileText = await file.text()
            const parsed = JSON.parse(fileText)
            const nextCoordinates = extractCoordinatesFromGeoJson(parsed)
            const validation = validateCoordinates(nextCoordinates)

            if (!validation.valid) {
                toast.error(validation.error || 'Invalid GeoJSON polygon.')
                return
            }

            setCoordinates(nextCoordinates)
            setActiveTab('upload')
            toast.success('GeoJSON loaded successfully.')
        } catch (error) {
            console.error('Error parsing GeoJSON file:', error)
            toast.error('Could not parse GeoJSON file.')
        } finally {
            event.target.value = ''
        }
    }

    async function handleUploadProjectGeometry(projectName: string, projectDescription: string): Promise<boolean> {
        if (!geometryValidation.valid) {
            toast.error(geometryValidation.error || 'Please provide a valid polygon.')
            return false
        }

        try {
            setIsUploadingGeometry(true)
            const payload = {
                projectName,
                description: projectDescription,
                coordinates: validCoordinates,
                geoJson: toGeoJsonPolygon(validCoordinates),
                sourceTab: activeTab as GeometrySourceTab,
            }

            const response = await postProjectGeometryMock(payload)
            toast.success(`Project geometry uploaded. Mock id: ${response.id}`)
            return true
        } catch (error) {
            console.error('Error uploading geometry:', error)
            toast.error('Could not upload project geometry.')
            return false
        } finally {
            setIsUploadingGeometry(false)
        }
    }

    return (
        <>
            <LoadingOverlay
                isLoading={isLoading}
                text={loadingText}
                showFunFact={true}
            />

            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <Link
                        to="/"
                        className="inline-flex items-center text-green-600 hover:text-green-800 mb-4 transition-colors"
                    >
                        <ArrowLeft className="mr-2" />
                        Back to Projects
                    </Link>

                    <h1 className="text-3xl font-extrabold text-gray-800 flex items-center">
                        <TreePine className="text-green-600 mr-3" size={32} />
                        Register New Project
                    </h1>
                </div>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
                        <h2 className="text-xl font-semibold">Project Registration</h2>
                        <p className="text-green-100 mt-1">Create a new carbon credit project</p>
                    </div>

                    <div className="p-6">
                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TreePine className="text-green-600" size={24} />
                                        <h3 className="font-semibold text-gray-800">Project Name</h3>
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                                        placeholder="e.g., Amazon Reforestation Initiative"
                                    />
                                </div>

                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Leaf className="text-green-600" size={24} />
                                        <h3 className="font-semibold text-gray-800">Total Carbon Credits</h3>
                                    </div>
                                    <input
                                        type="number"
                                        name="totalTokens"
                                        id="totalTokens"
                                        required
                                        min="1"
                                        value={formData.totalTokens}
                                        onChange={(e) => setFormData({ ...formData, totalTokens: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                                        placeholder="1000"
                                    />
                                </div>
                            </div>

                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <FileText className="text-green-600" size={24} />
                                    <h3 className="font-semibold text-gray-800">Project Description</h3>
                                </div>
                                <textarea
                                    name="description"
                                    id="description"
                                    required
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                                    placeholder="Describe your carbon credit project, its impact, and methodology..."
                                />
                            </div>

                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <MapPinned className="text-green-600" size={24} />
                                        <h3 className="font-semibold text-gray-800">Project Geometry</h3>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Add polygon coordinates (max {MAX_POLYGON_POINTS}), convert to GeoJSON and upload to API mock.
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2" role="tablist" aria-label="Geometry input methods">
                                    <button
                                        type="button"
                                        role="tab"
                                        aria-selected={activeTab === 'map'}
                                        onClick={() => setActiveTab('map')}
                                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                                            activeTab === 'map'
                                                ? 'bg-green-600 text-white border-green-600'
                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <MapPinned size={18} />
                                        Interactive Map
                                    </button>

                                    <button
                                        type="button"
                                        role="tab"
                                        aria-selected={activeTab === 'inputs'}
                                        onClick={() => setActiveTab('inputs')}
                                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                                            activeTab === 'inputs'
                                                ? 'bg-green-600 text-white border-green-600'
                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <ListOrdered size={18} />
                                        Coordinate Inputs
                                    </button>

                                    <button
                                        type="button"
                                        role="tab"
                                        aria-selected={activeTab === 'upload'}
                                        onClick={() => setActiveTab('upload')}
                                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                                            activeTab === 'upload'
                                                ? 'bg-green-600 text-white border-green-600'
                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <Upload size={18} />
                                        Upload GeoJSON
                                    </button>
                                </div>

                                <div
                                    role="tabpanel"
                                    className="bg-white border border-gray-200 rounded-lg p-4"
                                >
                                    {activeTab === 'map' && (
                                        <div className="space-y-3">
                                            <p className="text-sm text-gray-600">
                                                Draw a polygon directly on the map. Use 3 to {MAX_POLYGON_POINTS} coordinates.
                                            </p>
                                            <div className="h-[420px] w-full rounded-lg overflow-hidden border border-gray-300">
                                                <MapContainer
                                                    center={MAP_CENTER}
                                                    zoom={5}
                                                    className="h-full w-full"
                                                >
                                                    <TileLayer
                                                        attribution='&copy; OpenStreetMap contributors'
                                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                    />
                                                    <MapPolygonEditor
                                                        coordinates={coordinates}
                                                        onCoordinatesChange={setCoordinates}
                                                        isActive={activeTab === 'map'}
                                                    />
                                                </MapContainer>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'inputs' && (
                                        <div className="space-y-4">
                                            <p className="text-sm text-gray-600">
                                                Add latitude and longitude manually. Maximum {MAX_POLYGON_POINTS} coordinates.
                                            </p>

                                            {coordinates.length === 0 && (
                                                <p className="text-sm text-gray-500">No coordinates yet. Add your first coordinate.</p>
                                            )}

                                            <div className="space-y-3">
                                                {coordinates.map((coord, index) => (
                                                    <div key={`coordinate-${index}`} className="grid gap-3 md:grid-cols-[1fr_1fr_auto] items-end">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Latitude {index + 1}
                                                            </label>
                                                            <input
                                                                type="number"
                                                                step="any"
                                                                value={Number.isFinite(coord.lat) ? coord.lat : ''}
                                                                onChange={(event) => updateCoordinate(index, 'lat', event.target.value)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                                placeholder="-34.6037"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                Longitude {index + 1}
                                                            </label>
                                                            <input
                                                                type="number"
                                                                step="any"
                                                                value={Number.isFinite(coord.lng) ? coord.lng : ''}
                                                                onChange={(event) => updateCoordinate(index, 'lng', event.target.value)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                                                placeholder="-58.3816"
                                                            />
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() => removeCoordinate(index)}
                                                            className="inline-flex items-center justify-center gap-2 px-3 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                                        >
                                                            <Trash2 size={16} />
                                                            Remove
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={addCoordinate}
                                                disabled={coordinates.length >= MAX_POLYGON_POINTS}
                                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                                                    coordinates.length >= MAX_POLYGON_POINTS
                                                        ? 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed'
                                                        : 'bg-white text-green-700 border-green-300 hover:bg-green-50'
                                                    }`}
                                            >
                                                <Plus size={16} />
                                                Add coordinate
                                            </button>
                                        </div>
                                    )}

                                    {activeTab === 'upload' && (
                                        <div className="space-y-4">
                                            <p className="text-sm text-gray-600">
                                                Upload a .geojson or .json file containing a Polygon. The first polygon found will be used.
                                            </p>
                                            <input
                                                type="file"
                                                accept=".geojson,.json,application/json,application/geo+json"
                                                onChange={handleGeoJsonUpload}
                                                className="w-full px-3 py-3 border border-dashed border-green-300 rounded-lg bg-white"
                                            />
                                            <p className="text-xs text-gray-500">
                                                Supported GeoJSON types: Polygon, Feature(Polygon), FeatureCollection(first Polygon).
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="grid gap-4 md:grid-cols-1">
                                    <div className="bg-gray-900 text-green-200 rounded-lg p-4 overflow-x-auto">
                                        <h3 className="font-semibold text-white mb-2">GeoJSON Preview</h3>
                                        <pre className="text-xs whitespace-pre-wrap break-words">
                                            {geoJsonPreview || 'Complete a valid polygon to see the GeoJSON preview.'}
                                        </pre>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={!address || isPending || isUploadingGeometry || isWaitingForReceipt}
                                    className={`${
                                        !address || isPending || isUploadingGeometry || isWaitingForReceipt
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:shadow-lg transform hover:scale-105'
                                        } text-white px-8 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md flex items-center space-x-2`}
                                >
                                    <span>🌱</span>
                                    <span>{isUploadingGeometry ? 'Uploading geometry...' : isPending || isWaitingForReceipt ? 'Registering...' : 'Register Project'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {!address && (
                    <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <span className="text-yellow-600 mr-2">⚠️</span>
                            <p className="text-yellow-800">
                                Please connect your wallet to register a new project.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}