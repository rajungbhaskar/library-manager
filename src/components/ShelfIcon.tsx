import React from 'react';

interface ShelfIconProps {
    className?: string;
    style?: React.CSSProperties;
    size?: string;
    color?: string;
}

const ShelfIcon: React.FC<ShelfIconProps> = ({ className = '', style = {}, size, color }) => {
    const containerStyle: React.CSSProperties = {
        ...style,
        fontSize: size || 'inherit',
        color: color || 'currentColor',
        display: 'inline-flex',
        verticalAlign: 'middle',
    };

    return (
        <div className={`shelf-icon-container ${className}`} style={containerStyle}>
            <div className="h-shelf-logo">
                <div className="h-side"></div>
                <div className="h-middle">
                    <div className="h-books">
                        <div className="h-book b1"></div>
                        <div className="h-book b2"></div>
                        <div className="h-book b3"></div>
                    </div>
                    <div className="h-shelf"></div>
                </div>
                <div className="h-side"></div>
            </div>
            <style>{`
        .h-shelf-logo {
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: 1.2em;
            width: 0.9em;
            margin: 0 0.05em;
            position: relative;
        }

        .h-side {
            width: 0.18em;
            height: 100%;
            background-color: var(--color-primary); /* Rack Color - Add Book Color */
            border-radius: 0.05em;
        }

        .h-middle {
            flex: 1;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            position: relative;
        }

        .h-shelf {
            width: 100%;
            height: 0.15em;
            background-color: var(--color-primary); /* Rack Color - Add Book Color */
            border-radius: 0.05em;
            margin-top: 0;
        }

        .h-books {
            position: absolute;
            bottom: calc(50% + 0.075em); /* Sit exactly on top of shelf (center + half shelf height) */
            left: 0;
            display: flex;
            align-items: flex-end;
            justify-content: flex-start; /* Align left to touch side */
            gap: 0.02em;
        }

        .h-book {
            width: 0.14em;
            border-radius: 0.04em 0.04em 0 0;
        }

        .b1 { height: 0.45em; background-color: #10b981; } /* Emerald Green */
        .b2 { height: 0.4em; background-color: #f59e0b; } /* Amber */
        .b3 { height: 0.42em; background-color: #ec4899; transform: rotate(-12deg); transform-origin: bottom left; margin-left: 0.02em; } /* Pink */
      `}</style>
        </div>
    );
};

export default ShelfIcon;
