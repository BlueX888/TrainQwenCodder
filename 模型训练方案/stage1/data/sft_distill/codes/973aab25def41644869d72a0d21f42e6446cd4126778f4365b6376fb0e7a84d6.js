class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.mapGenerated = false; // 状态信号：地图是否生成完成
    this.tileCount = 0; // 状态信号：已生成的瓦片数量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const GRID_SIZE = 20; // 20x20 网格
    const TILE_SIZE = 32; // 每个瓦片 32x32 像素

    // 创建两种青色纹理
    this.createTileTextures(TILE_SIZE);

    // 创建空白 Tilemap
    const map = this.make.tilemap({
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
      width: GRID_SIZE,
      height: GRID_SIZE
    });

    // 添加 Tileset（使用我们创建的纹理）
    const tileset = map.addTilesetImage('tiles', 'tiles', TILE_SIZE, TILE_SIZE);

    // 创建图层
    const layer = map.createBlankLayer('layer1', tileset, 0, 0);

    // 使用二维数组生成棋盘格
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        // 棋盘格规则：(x + y) % 2 决定使用哪种颜色
        const tileIndex = (x + y) % 2 === 0 ? 0 : 1;
        layer.putTileAt(tileIndex, x, y);
        this.tileCount++; // 记录瓦片数量
      }
    }

    // 设置相机边界以查看整个地图
    this.cameras.main.setBounds(0, 0, GRID_SIZE * TILE_SIZE, GRID_SIZE * TILE_SIZE);
    this.cameras.main.centerOn(GRID_SIZE * TILE_SIZE / 2, GRID_SIZE * TILE_SIZE / 2);

    // 标记地图生成完成
    this.mapGenerated = true;

    // 添加状态文本显示
    const statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    statusText.setScrollFactor(0); // 固定在屏幕上
    statusText.setText([
      `Map Generated: ${this.mapGenerated}`,
      `Tile Count: ${this.tileCount}`,
      `Grid Size: ${GRID_SIZE}x${GRID_SIZE}`
    ]);

    console.log('Checkerboard map generated successfully!');
    console.log(`Total tiles: ${this.tileCount}`);
  }

  createTileTextures(tileSize) {
    // 创建浅青色瓦片（tile 0）
    const graphics1 = this.add.graphics();
    graphics1.fillStyle(0x00CED1, 1); // 浅青色 (DarkTurquoise)
    graphics1.fillRect(0, 0, tileSize, tileSize);
    graphics1.lineStyle(1, 0x008B8B, 0.3); // 添加边框
    graphics1.strokeRect(0, 0, tileSize, tileSize);
    graphics1.generateTexture('tile0', tileSize, tileSize);
    graphics1.destroy();

    // 创建深青色瓦片（tile 1）
    const graphics2 = this.add.graphics();
    graphics2.fillStyle(0x008B8B, 1); // 深青色 (DarkCyan)
    graphics2.fillRect(0, 0, tileSize, tileSize);
    graphics2.lineStyle(1, 0x00CED1, 0.3); // 添加边框
    graphics2.strokeRect(0, 0, tileSize, tileSize);
    graphics2.generateTexture('tile1', tileSize, tileSize);
    graphics2.destroy();

    // 创建组合纹理图集（Tilemap 需要）
    const combinedGraphics = this.add.graphics();
    
    // 第一个瓦片（浅青色）
    combinedGraphics.fillStyle(0x00CED1, 1);
    combinedGraphics.fillRect(0, 0, tileSize, tileSize);
    combinedGraphics.lineStyle(1, 0x008B8B, 0.3);
    combinedGraphics.strokeRect(0, 0, tileSize, tileSize);
    
    // 第二个瓦片（深青色）
    combinedGraphics.fillStyle(0x008B8B, 1);
    combinedGraphics.fillRect(tileSize, 0, tileSize, tileSize);
    combinedGraphics.lineStyle(1, 0x00CED1, 0.3);
    combinedGraphics.strokeRect(tileSize, 0, tileSize, tileSize);
    
    combinedGraphics.generateTexture('tiles', tileSize * 2, tileSize);
    combinedGraphics.destroy();
  }

  update(time, delta) {
    // 可以在这里添加动态更新逻辑
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene,
  pixelArt: true // 保持像素清晰
};

new Phaser.Game(config);