export async function getLatestRelease() {
  try {
    const res = await fetch('https://api.github.com/repos/imrj05/db-connect/releases/latest', {
      next: { revalidate: 3600 }, // Revalidate every hour
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching latest GitHub release:', error);
    return null;
  }
}
