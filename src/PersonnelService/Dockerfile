# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY src/PersonnelService/PersonnelService.csproj src/PersonnelService/
RUN dotnet restore src/PersonnelService/PersonnelService.csproj

COPY src/PersonnelService/ src/PersonnelService/
WORKDIR /src/src/PersonnelService
RUN dotnet publish -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8089
ENV ASPNETCORE_URLS=http://+:8089
ENTRYPOINT ["dotnet", "PersonnelService.dll"]
