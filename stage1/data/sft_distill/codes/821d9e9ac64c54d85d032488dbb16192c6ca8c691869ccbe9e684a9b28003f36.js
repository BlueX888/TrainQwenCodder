class CheckerboardScene extends Phaser.Scene {
  constructor() {
    super('CheckerboardScene');
    this.gridSize = 5;
    this.tileSize = 80;
    this.tilesRendered = 0;
    this.renderComplete = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建5x5的二维数组
    const gridData = [];
    for (let row = 0; row < this.gridSize; row++) {
      gridData[row] = [];
      for (let col = 0; col < this.gridSize; col++) {
        // 交替模式：(row + col) % 2 决定颜色
        gridData[row][col] = (row + col) % 2;
      }
    }

    // 定义两种红色
    const darkRed = 0xCC0000;   // 深红
    const lightRed = 0xFF6666;  // 浅红

    // 使用Graphics创建纹理
    const graphics = this.add.graphics();

    // 创建深红色纹理
    graphics.fillStyle(darkRed, 1);
    graphics.fillRect(0, 0, this.tileSize, this.tileSize);
    graphics.generateTexture('darkRedTile', this.tileSize, this.tileSize);
    graphics.clear();

    // 创建浅红色纹理
    graphics.fillStyle(lightRed, 1);
    graphics.fillRect(0, 0, this.tileSize, this.tileSize);
    graphics.generateTexture('lightRedTile', this.tileSize, this.tileSize);
    graphics.destroy();

    // 计算居中偏移
    const offsetX = (this.scale.width - this.gridSize * this.tileSize) / 2;
    const offsetY = (this.scale.height - this.gridSize * this.tileSize) / 2;

    // 根据二维数组渲染棋盘格
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        const x = offsetX + col * this.tileSize;
        const y = offsetY + row * this.tileSize;
        
        // 根据数组值选择纹理
        const textureKey = gridData[row][col] === 0 ? 'darkRedTile' : 'lightRedTile';
        
        // 创建图像对象
        const tile = this.add.image(x, y, textureKey);
        tile.setOrigin(0, 0);
        
        // 添加边框以更清晰地区分格子
        const border = this.add.graphics();
        border.lineStyle(2, 0x880000, 1);
        border.strokeRect(x, y, this.tileSize, this.tileSize);
        
        this.tilesRendered++;
      }
    }

    // 标记渲染完成
    this.renderComplete = true;

    // 添加文本显示状态信息
    const statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    statusText.setText([
      `Grid Size: ${this.gridSize}x${this.gridSize}`,
      `Tiles Rendered: ${this.tilesRendered}`,
      `Render Complete: ${this.renderComplete}`,
      `Total Tiles: ${this.gridSize * this.gridSize}`
    ]);

    // 添加标题
    const title = this.add.text(this.scale.width / 2, 20, 'Red Checkerboard Pattern', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    title.setOrigin(0.5, 0);
  }

  update(time, delta) {
    // 不需要每帧更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 600,
  height: 600,
  backgroundColor: '#222222',
  scene: CheckerboardScene
};

// 创建游戏实例
new Phaser.Game(config);