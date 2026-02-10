class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentZoomIndex = 1; // 初始缩放索引（对应1.0倍）
    this.zoomLevels = [0.5, 1.0, 1.5, 2.0]; // 缩放级别数组
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 绘制网格背景，便于观察缩放效果
    this.drawGrid();

    // 创建一些参考对象
    this.createReferenceObjects();

    // 创建缩放提示文本
    this.zoomText = this.add.text(16, 16, '', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.zoomText.setScrollFactor(0); // 固定在屏幕上，不受相机缩放影响

    // 创建操作提示
    this.instructionText = this.add.text(16, 60, 'Press SPACE to zoom', {
      fontSize: '18px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.instructionText.setScrollFactor(0);

    // 获取主相机
    this.mainCamera = this.cameras.main;
    
    // 设置初始缩放
    this.updateZoom();

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 监听空格键按下事件
    this.spaceKey.on('down', () => {
      this.toggleZoom();
    });
  }

  drawGrid() {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x333333, 0.5);

    // 绘制垂直线
    for (let x = 0; x <= 800; x += 50) {
      graphics.lineBetween(x, 0, x, 600);
    }

    // 绘制水平线
    for (let y = 0; y <= 600; y += 50) {
      graphics.lineBetween(0, y, 800, y);
    }

    // 绘制中心十字线（加粗）
    graphics.lineStyle(2, 0x00ff00, 1);
    graphics.lineBetween(400, 0, 400, 600);
    graphics.lineBetween(0, 300, 800, 300);
  }

  createReferenceObjects() {
    // 创建中心圆形
    const centerCircle = this.add.graphics();
    centerCircle.fillStyle(0xff0000, 1);
    centerCircle.fillCircle(400, 300, 30);

    // 创建四个角落的矩形
    const corners = [
      { x: 100, y: 100, color: 0xff00ff },
      { x: 700, y: 100, color: 0x00ffff },
      { x: 100, y: 500, color: 0xffff00 },
      { x: 700, y: 500, color: 0x00ff00 }
    ];

    corners.forEach(corner => {
      const rect = this.add.graphics();
      rect.fillStyle(corner.color, 1);
      rect.fillRect(corner.x - 25, corner.y - 25, 50, 50);
    });

    // 创建一些随机分布的小圆点
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const dot = this.add.graphics();
      dot.fillStyle(0xffffff, 0.6);
      dot.fillCircle(x, y, 5);
    }
  }

  toggleZoom() {
    // 切换到下一个缩放级别
    this.currentZoomIndex = (this.currentZoomIndex + 1) % this.zoomLevels.length;
    this.updateZoom();
  }

  updateZoom() {
    const zoomLevel = this.zoomLevels[this.currentZoomIndex];
    
    // 设置相机缩放
    this.mainCamera.setZoom(zoomLevel);
    
    // 更新文本显示
    this.zoomText.setText(`Zoom: ${zoomLevel.toFixed(1)}x`);
    
    // 验证状态信号
    console.log(`Camera zoom changed to: ${zoomLevel}x (index: ${this.currentZoomIndex})`);
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a1a',
  scene: GameScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出验证状态（便于测试）
window.gameState = {
  getCurrentZoom: () => {
    const scene = game.scene.scenes[0];
    return scene ? scene.zoomLevels[scene.currentZoomIndex] : null;
  },
  getZoomIndex: () => {
    const scene = game.scene.scenes[0];
    return scene ? scene.currentZoomIndex : null;
  },
  getZoomLevels: () => {
    const scene = game.scene.scenes[0];
    return scene ? scene.zoomLevels : null;
  }
};