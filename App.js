import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    SafeAreaView,
    RefreshControl,
    Alert,
    Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";

const { width, height } = Dimensions.get("window");

export default function WeatherApp() {
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [location, setLocation] = useState({ lat: 30.9009, lon: 75.8573 }); // Ludhiana coordinates

    const getWeatherIcon = (weatherCode, isDay) => {
        const iconMap = {
            0: isDay ? "☀️" : "🌙",
            1: isDay ? "🌤️" : "🌙",
            2: "⛅",
            3: "☁️",
            45: "🌫️",
            48: "🌫️",
            51: "🌦️",
            53: "🌦️",
            55: "🌦️",
            61: "🌧️",
            63: "🌧️",
            65: "🌧️",
            80: "🌦️",
            81: "🌦️",
            82: "🌦️",
            85: "🌨️",
            86: "🌨️",
            95: "⛈️",
            96: "⛈️",
            99: "⛈️",
        };
        return iconMap[weatherCode] || "🌤️";
    };

    const getWeatherDescription = (weatherCode) => {
        const descriptions = {
            0: "Clear sky",
            1: "Mainly clear",
            2: "Partly cloudy",
            3: "Overcast",
            45: "Fog",
            48: "Depositing rime fog",
            51: "Light drizzle",
            53: "Moderate drizzle",
            55: "Dense drizzle",
            61: "Slight rain",
            63: "Moderate rain",
            65: "Heavy rain",
            71: "Slight snow fall",
            73: "Moderate snow fall",
            75: "Heavy snow fall",
            77: "Snow grains",
            80: "Slight rain showers",
            81: "Moderate rain showers",
            82: "Violent rain showers",
            85: "Slight snow showers",
            86: "Heavy snow showers",
            95: "Thunderstorm",
            96: "Thunderstorm with slight hail",
            99: "Thunderstorm with heavy hail",
        };
        return descriptions[weatherCode] || "Unknown";
    };

    const fetchWeatherData = async () => {
        try {
            const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=auto&forecast_days=7`
            );

            if (!response.ok) {
                throw new Error("Failed to fetch weather data");
            }

            const data = await response.json();
            setWeatherData(data);
        } catch (error) {
            Alert.alert(
                "Error",
                "Failed to fetch weather data. Please try again."
            );
            console.error("Weather fetch error:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchWeatherData();
    };

    useEffect(() => {
        fetchWeatherData();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
        });
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <LinearGradient
                    colors={["#4A90E2", "#7BB3F0"]}
                    style={styles.loadingContainer}
                >
                    <ActivityIndicator size="large" color="#FFFFFF" />
                    <Text style={styles.loadingText}>
                        Loading weather data...
                    </Text>
                </LinearGradient>
            </SafeAreaView>
        );
    }

    if (!weatherData) {
        return (
            <SafeAreaView style={styles.container}>
                <LinearGradient
                    colors={["#4A90E2", "#7BB3F0"]}
                    style={styles.errorContainer}
                >
                    <Text style={styles.errorText}>
                        Unable to load weather data
                    </Text>
                </LinearGradient>
            </SafeAreaView>
        );
    }

    const { current, daily } = weatherData;

    return (
        <View style={[styles.container, { height: height, width: width }]}>
            <StatusBar hidden />
            <LinearGradient
                colors={
                    current.is_day
                        ? ["#4A90E2", "#7BB3F0"]
                        : ["#2C3E50", "#34495E"]
                }
                style={styles.gradient}
            >
                <ScrollView
                    style={styles.scrollView}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#FFFFFF"
                        />
                    }
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.locationText}>
                            Ludhiana, Punjab
                        </Text>
                        <Text style={styles.dateText}>
                            {new Date().toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </Text>
                    </View>

                    {/* Current Weather */}
                    <View style={styles.currentWeather}>
                        <Text style={styles.weatherIcon}>
                            {getWeatherIcon(
                                current.weather_code,
                                current.is_day
                            )}
                        </Text>
                        <Text style={styles.temperature}>
                            {Math.round(current.temperature_2m)}°C
                        </Text>
                        <Text style={styles.description}>
                            {getWeatherDescription(current.weather_code)}
                        </Text>
                        <Text style={styles.feelsLike}>
                            Feels like{" "}
                            {Math.round(current.apparent_temperature)}°C
                        </Text>
                    </View>

                    {/* Weather Details */}
                    <View style={styles.detailsContainer}>
                        <View style={styles.detailRow}>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>
                                    💧 Humidity
                                </Text>
                                <Text style={styles.detailValue}>
                                    {current.relative_humidity_2m}%
                                </Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>
                                    🌧️ Precipitation
                                </Text>
                                <Text style={styles.detailValue}>
                                    {current.precipitation} mm
                                </Text>
                            </View>
                        </View>
                        <View style={styles.detailRow}>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>
                                    💨 Wind Speed
                                </Text>
                                <Text style={styles.detailValue}>
                                    {current.wind_speed_10m} km/h
                                </Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>
                                    🧭 Wind Direction
                                </Text>
                                <Text style={styles.detailValue}>
                                    {current.wind_direction_10m}°
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* 7-Day Forecast */}
                    <View style={styles.forecastContainer}>
                        <Text style={styles.forecastTitle}>7-Day Forecast</Text>
                        {daily.time.map((date, index) => (
                            <View key={index} style={styles.forecastItem}>
                                <Text style={styles.forecastDate}>
                                    {index === 0 ? "Today" : formatDate(date)}
                                </Text>
                                <View style={styles.forecastMiddle}>
                                    <Text style={styles.forecastIcon}>
                                        {getWeatherIcon(
                                            daily.weather_code[index],
                                            true
                                        )}
                                    </Text>
                                    <Text style={styles.forecastDescription}>
                                        {getWeatherDescription(
                                            daily.weather_code[index]
                                        )}
                                    </Text>
                                </View>
                                <View style={styles.forecastTemp}>
                                    <Text style={styles.forecastHigh}>
                                        {Math.round(
                                            daily.temperature_2m_max[index]
                                        )}
                                        °
                                    </Text>
                                    <Text style={styles.forecastLow}>
                                        {Math.round(
                                            daily.temperature_2m_min[index]
                                        )}
                                        °
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        color: "#FFFFFF",
        fontSize: 16,
        marginTop: 16,
        fontWeight: "500",
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    errorText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "500",
    },
    header: {
        alignItems: "center",
        paddingTop: 20,
        paddingBottom: 10,
    },
    locationText: {
        color: "#FFFFFF",
        fontSize: 24,
        fontWeight: "600",
        marginBottom: 4,
    },
    dateText: {
        color: "#FFFFFF",
        fontSize: 16,
        opacity: 0.8,
    },
    currentWeather: {
        alignItems: "center",
        paddingVertical: 30,
    },
    weatherIcon: {
        fontSize: 80,
        marginBottom: 10,
    },
    temperature: {
        color: "#FFFFFF",
        fontSize: 72,
        fontWeight: "200",
        marginBottom: 5,
    },
    description: {
        color: "#FFFFFF",
        fontSize: 20,
        fontWeight: "500",
        marginBottom: 5,
    },
    feelsLike: {
        color: "#FFFFFF",
        fontSize: 16,
        opacity: 0.8,
    },
    detailsContainer: {
        marginHorizontal: 20,
        marginVertical: 20,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderRadius: 16,
        padding: 20,
    },
    detailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 15,
    },
    detailItem: {
        flex: 1,
        alignItems: "center",
    },
    detailLabel: {
        color: "#FFFFFF",
        fontSize: 14,
        opacity: 0.8,
        marginBottom: 5,
    },
    detailValue: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "600",
    },
    forecastContainer: {
        marginHorizontal: 20,
        marginBottom: 20,
    },
    forecastTitle: {
        color: "#FFFFFF",
        fontSize: 20,
        fontWeight: "600",
        marginBottom: 15,
    },
    forecastItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderRadius: 12,
        padding: 15,
        marginBottom: 8,
    },
    forecastDate: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "500",
        width: 80,
    },
    forecastMiddle: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        marginLeft: 15,
    },
    forecastIcon: {
        fontSize: 24,
        marginRight: 10,
    },
    forecastDescription: {
        color: "#FFFFFF",
        fontSize: 14,
        opacity: 0.8,
    },
    forecastTemp: {
        alignItems: "flex-end",
    },
    forecastHigh: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "600",
    },
    forecastLow: {
        color: "#FFFFFF",
        fontSize: 16,
        opacity: 0.7,
    },
});
