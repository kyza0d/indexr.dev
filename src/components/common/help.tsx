import React from 'react'
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from '@/components/ui/separator'
import ReactMarkdown from 'react-markdown';
import {
  ChevronDown,
  ChevronRight,
} from 'lucide-react'

// Types
interface HelpPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Section {
  id: string;
  title: string;
  description: string;
  subsections?: Subsection[];
}

interface Subsection {
  id: string;
  title: string;
  description: string;
}

interface DescriptionProps {
  text: string;
}

interface UseHelpSectionsReturn {
  expandedSections: string[];
  toggleSection: (sectionId: string) => void;
  sectionRefs: React.MutableRefObject<{ [key: string]: HTMLElement | null }>;
}

// Sections Data (kept within the file)
const sections: Section[] = [
  {
    id: 'get-started',
    title: 'Get Started',
    description: "Indexr allows you to explore and analyze JSON and CSV datasets efficiently. Upload your data to navigate, search, and understand your datasets with ease.",
    subsections: [
      {
        id: 'quick-start',
        title: 'Quick Start Guide',
        description: `1. Click **Upload** in the top right corner.
2. Select a JSON or CSV file from your computer.
3. Your dataset will appear in the main view.
4. Use **Tree View** or **Grid View** to explore your data.
5. Utilize the search function to find specific data points.`,
      },
      {
        id: 'system-requirements',
        title: 'System Requirements',
        description: `- Modern browsers: **Chrome**, **Firefox**, or **Edge**.
- For datasets larger than **100MB**, at least **8GB RAM** is recommended for optimal performance.`,
      }
    ]
  },
  {
    id: 'data-exploration',
    title: 'Data Exploration',
    description: "Leverage Indexr's features to analyze your datasets effectively:",
    subsections: [
      {
        id: 'tree-view',
        title: 'Tree View',
        description: `Ideal for hierarchical data like nested JSON:

- Click arrows to expand or collapse nodes.
- Use **Expand All** to view the entire structure.
- Right-click a node to copy its path or value.
- Icons indicate data types (e.g., blue for numbers, green for strings).

**Tip:** Use \`+\` and \`-\` keys to expand or collapse nodes quickly.`,
      },
      {
        id: 'grid-view',
        title: 'Grid View',
        description: `Perfect for tabular data like CSV files:

- Click column headers to sort data.
- Drag column borders to resize.
- Use **Freeze Columns** to keep key columns visible.
- Right-click cells to copy, filter, or perform calculations (sum, average).

**Note:** For large datasets, Grid View displays up to **100,000 rows**.`,
      },
      {
        id: 'search',
        title: 'Search',
        description: `Find data points swiftly using the search bar:

- Supports regex and advanced queries (e.g., \`name:John AND age>30\`).
- Highlights results in both Tree and Grid views.
- Click a result to navigate to its location.

**Tip:** Use **Search within results** to refine complex queries.`,
      },
    ],
  },
  {
    id: 'data-management',
    title: 'Data Management',
    description: "Manage your datasets effectively within Indexr:",
    subsections: [
      {
        id: 'upload-dataset',
        title: 'Upload Dataset',
        description: `To upload a dataset:

1. Click **Upload** in the top right corner.
2. Select a JSON or CSV file (up to **1GB**).
3. Choose privacy settings and add tags.
4. Click **Upload** to start.

_Indexr analyzes your data for efficient exploration. Large files may take a few minutes._`,
      },
      {
        id: 'supported-formats',
        title: 'Supported Formats',
        description: `- **JSON (.json):** Supports nested structures.
- **CSV (.csv):** Auto-detects delimiters.
- **JSONL (.jsonl):** Line-delimited JSON.

**Coming soon:** Support for Excel (.xlsx) and Parquet (.parquet) files.`,
      },
      {
        id: 'dataset-visibility',
        title: 'Dataset Visibility',
        description: `Control who can access your datasets:

- **Private:** Only you can see it.
- **Public:** Visible to all Indexr users.
- **Shared:** Visible to specific users you invite.

_To change visibility settings:_

1. Go to the dataset's **Settings** page.
2. Under **Visibility**, select an option.
3. For **Shared** datasets, enter the email addresses of invitees.`,
      },
    ],
  },
  {
    id: 'features',
    title: 'Advanced Features',
    description: "Enhance your data analysis with these advanced tools:",
    subsections: [
      {
        id: 'raw-data-view',
        title: 'Raw Data View',
        description: `Access the original data format:

1. Click **Raw Data** in the toolbar.
2. Examine the syntax-highlighted structure.
3. Copy sections using the **Copy** button.
4. Use **Load More** for additional data chunks.

**Tip:** Use Raw Data View to identify data quality issues or unexpected structures.`,
      },
      {
        id: 'auto-tagging',
        title: 'Auto-tagging',
        description: `Automatically categorize your data:

1. Enable **Auto-tagging** during upload.
2. Indexr analyzes content and structure.
3. Suggested tags appear in the **Tags** section.
4. Review and edit tags as needed.

**Note:** Works best with datasets that have clear categories or consistent structures.`,
      },
      {
        id: 'recent-datasets',
        title: 'Recent Datasets',
        description: `Access frequently used datasets:

- Find **Recent Datasets** in the left sidebar.
- Click a dataset name to open it.
- Hover to preview structure and key stats.
- Pin important datasets to keep them at the top.

_Indexr tracks your 20 most recent datasets for easy access._`,
      },
      {
        id: 'data-visualization',
        title: 'Data Visualization',
        description: `Create visual representations of your data:

1. In Grid View, select columns to visualize.
2. Click **Visualize** in the toolbar.
3. Choose a chart type (bar, line, scatter, etc.).
4. Customize colors, labels, and axes.
5. Export as an image or interactive HTML.

**Note:** Supports numerical and categorical data up to **1 million rows**.`,
      },
    ],
  },
];


/**
 * Custom hook to manage expanded sections and scrolling for the help sections.
 * @returns An object containing expandedSections, toggleSection, and sectionRefs.
 */
const useHelpSections = (): UseHelpSectionsReturn => {
  const [expandedSections, setExpandedSections] = React.useState<string[]>(['get-started']);
  const sectionRefs = React.useRef<{ [key: string]: HTMLElement | null }>({});

  const toggleSection = React.useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      const isExpanded = prev.includes(sectionId);
      const newExpandedSections = isExpanded
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId];

      if (!isExpanded && sectionRefs.current[sectionId]) {
        // Scroll to the section only when expanding
        sectionRefs.current[sectionId]?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }

      return newExpandedSections;
    });
  }, []);

  return { expandedSections, toggleSection, sectionRefs };
};

/**
 * Description component for rendering markdown content.
 */
const Description: React.FC<DescriptionProps> = ({ text }) => {
  const markdownComponents = React.useMemo(() => ({
    h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h1 className="text-2xl font-bold mt-6" {...props} />,
    h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h2 className="text-xl font-semibold mt-4" {...props} />,
    p: (props: React.HTMLAttributes<HTMLParagraphElement>) => <p className="mt-2" {...props} />,
    li: (props: React.LiHTMLAttributes<HTMLLIElement>) => <li className="ml-4 list-disc" {...props} />,
  }), []);

  return (
    <div className="description text-sm leading-relaxed mt-2">
      <ReactMarkdown components={markdownComponents}>
        {text}
      </ReactMarkdown>
    </div>
  );
};

/**
 * HelpSection component for rendering individual sections.
 */
const HelpSection: React.FC<{ id: string }> = ({ id }) => {
  const content = React.useMemo(() => {
    return sections.flatMap(section => [section, ...(section.subsections || [])]).find(item => item.id === id);
  }, [id]);

  if (!content) return null;

  return (
    <>
      <div id={id} className="space-y-4 mb-8">
        <h2 className="text-2xl font-bold flex items-center">
          {content.title}
        </h2>
        {content.description && <Description text={content.description} />}
      </div>
      <Separator />
    </>
  );
};

/**
 * LeftSidebar component for navigation.
 */
const LeftSidebar: React.FC<{
  expandedSections: string[];
  toggleSection: (sectionId: string) => void;
}> = ({ expandedSections, toggleSection }) => {
  return (
    <div className="w-64 border-r border-border bg-background">
      <ScrollArea className="h-full">
        <nav className="p-4 space-y-2">
          {sections.map(section => {
            const isExpanded = expandedSections.includes(section.id);
            return (
              <div key={section.id}>
                <Button
                  variant="ghost"
                  className="w-full justify-start px-2 py-1 text-sm font-medium"
                  onClick={() => toggleSection(section.id)}
                  aria-expanded={isExpanded}
                  aria-controls={`section-${section.id}`}
                >
                  {section.subsections && (
                    isExpanded ? (
                      <ChevronDown className="h-4 w-4 mr-2" />
                    ) : (
                      <ChevronRight className="h-4 w-4 mr-2" />
                    )
                  )}
                  {section.title}
                </Button>
                {isExpanded && section.subsections && (
                  <div className="ml-6 mt-1 space-y-1">
                    {section.subsections.map(sub => (
                      <Button
                        key={sub.id}
                        variant="ghost"
                        className="w-full justify-start px-2 py-1 text-sm"
                        onClick={() => {
                          document.getElementById(sub.id)?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start',
                          });
                        }}
                      >
                        {sub.title}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );
};

/**
 * MainContent component for displaying help content.
 */
const MainContent: React.FC<{
  sectionRefs: React.MutableRefObject<{ [key: string]: HTMLElement | null }>;
}> = ({ sectionRefs }) => {
  const renderContent = React.useCallback(() => {
    return sections.map(section => (
      <div key={section.id} ref={el => { sectionRefs.current[section.id] = el; }}>
        <HelpSection id={section.id} />
        {section.subsections?.map(sub => (
          <div key={sub.id} ref={el => { sectionRefs.current[sub.id] = el; }} className="mt-8">
            <HelpSection id={sub.id} />
          </div>
        ))}
      </div>
    ));
  }, [sectionRefs]);

  return (
    <div className="flex-grow">
      <ScrollArea className="h-full" type="always">
        <div className="p-4 max-w-3xl mx-auto space-y-16">
          {renderContent()}
        </div>
      </ScrollArea>
    </div>
  );
};

/**
 * HelpPopup component for displaying the help dialog.
 */
export const HelpPopup: React.FC<HelpPopupProps> = ({ isOpen, onClose }) => {
  const { expandedSections, toggleSection, sectionRefs } = useHelpSections();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 flex flex-col">
        <div className="flex-grow flex overflow-hidden">
          <LeftSidebar
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          />
          <MainContent
            sectionRefs={sectionRefs}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
