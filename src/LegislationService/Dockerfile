# build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ISG-Microservices.sln ./
COPY src/LegislationService/LegislationService.csproj src/LegislationService/
RUN dotnet restore src/LegislationService/LegislationService.csproj
COPY src/LegislationService/ src/LegislationService/
RUN dotnet publish src/LegislationService/LegislationService.csproj -c Release -o /app/publish

# runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8093
ENV ASPNETCORE_URLS=http://+:8093
ENTRYPOINT ["dotnet", "LegislationService.dll"]
