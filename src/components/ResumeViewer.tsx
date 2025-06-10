"use client";

import { useState } from 'react';
import { Button, Flex, IconButton, Text, Heading, Icon } from '@/once-ui/components';
import styles from './ui/cursor-override.module.css';

interface ResumeViewerProps {
    className?: string;
}

export default function ResumeViewer({ className }: ResumeViewerProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleDownload = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/resume?action=download');

            if (!response.ok) {
                throw new Error('Download failed');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'Likhith_Usurupati_Resume.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Download error:', error);
            alert('Failed to download resume. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePreview = () => {
        setIsModalOpen(true);
    };

    return (
        <>
            {/* Main Resume Section */}
            <Flex
                fitWidth
                border="brand-alpha-medium"
                className={className}
                style={{
                    backdropFilter: "blur(var(--static-space-1))",
                }}
                background="brand-alpha-weak"
                radius="full"
                padding="4"
                gap="8"
                marginBottom="m"
                vertical="center"
            >
                <Icon paddingLeft="12" name="fileDownload" onBackground="brand-weak" />
                <Flex paddingX="8">Resume</Flex>

                {/* Preview Button */}
                <IconButton
                    onClick={handlePreview}
                    data-border="rounded"
                    variant="secondary"
                    icon="eye"
                    aria-label="Preview Resume"
                />

                {/* Download Button */}
                <IconButton
                    onClick={handleDownload}
                    data-border="rounded"
                    variant="secondary"
                    icon="downloadBtn"
                    aria-label="Download Resume"
                    disabled={isLoading}
                />
            </Flex>            {/* Preview Modal */}
            {isModalOpen && (
                <div
                    className={styles.modalOverlay}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}
                    onClick={() => setIsModalOpen(false)}
                >
                    <div
                        className={styles.modalContent}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            backgroundColor: 'var(--neutral-base)',
                            borderRadius: 'var(--radius-l)',
                            padding: 'var(--space-16)',
                            width: '90vw',
                            height: '90vh',
                            maxWidth: '1200px',
                            maxHeight: '800px'
                        }}
                    >
                        <Flex direction="column" gap="16" style={{ height: '100%' }}>
                            <Flex horizontal="space-between" vertical="center">
                                <Heading variant="display-strong-s">Resume Preview</Heading>
                                <IconButton
                                    onClick={() => setIsModalOpen(false)}
                                    icon="close"
                                    variant="ghost"
                                    size="s"
                                />
                            </Flex>                            {/* PDF Viewer */}
                            <Flex
                                fillWidth
                                className={styles.iframeContainer}
                                style={{
                                    flex: 1,
                                    border: '1px solid var(--neutral-border-medium)',
                                    borderRadius: 'var(--radius-m)'
                                }}
                            >
                                <iframe
                                    src="/api/resume?action=view"
                                    width="100%"
                                    height="100%"
                                    style={{
                                        border: 'none',
                                        borderRadius: 'var(--radius-m)'
                                    }}
                                    title="Resume Preview"
                                />
                            </Flex>                            
                             {/* Modal Actions */}
                            <Flex gap="8" horizontal="center">
                                <Button
                                    className={styles.interactiveElement}
                                    onClick={handleDownload}
                                    prefixIcon="fileDownload"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Downloading...' : 'Download PDF'}
                                </Button>
                                <Button
                                    className={styles.interactiveElement}
                                    onClick={() => window.open('/api/resume?action=view', '_blank')}
                                    variant="secondary"
                                    prefixIcon="externalLink"
                                >
                                    Open in New Tab
                                </Button>
                                <Button
                                    className={styles.interactiveElement}
                                    onClick={() => setIsModalOpen(false)}
                                    variant="secondary"
                                    prefixIcon='x'
                                >
                                    Close
                                </Button>
                            </Flex>
                        </Flex>
                    </div>
                </div>
            )}
        </>
    );
}