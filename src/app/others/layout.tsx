import { Meta } from '@/once-ui/modules';
import { others } from '../resources/content';
import { baseURL } from '../resources';

export async function generateMetadata() {
    return Meta.generate({
        title: others.title,
        description: others.description,
        baseURL: baseURL,
        image: `${baseURL}/og?title=${encodeURIComponent(others.title)}`,
        path: others.path,
    });
}

export default function OthersLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
