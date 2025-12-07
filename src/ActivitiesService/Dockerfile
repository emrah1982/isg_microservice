# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore as distinct layers
COPY src/ActivitiesService/ActivitiesService.csproj ./ActivitiesService/ActivitiesService.csproj
RUN dotnet restore ./ActivitiesService/ActivitiesService.csproj

# Copy the remaining source and publish
COPY src/ActivitiesService/ ./ActivitiesService/
WORKDIR /src/ActivitiesService
RUN dotnet publish ./ActivitiesService.csproj -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:8091
EXPOSE 8091

# wwwroot for uploads
RUN mkdir -p /app/wwwroot/uploads

COPY --from=build /app/publish ./
ENTRYPOINT ["dotnet", "ActivitiesService.dll"]
