// 完整的 Phaser3 相机缩放示例
class ZoomScene extends Phaser.Scene {
  constructor() {
    super('ZoomScene');
    this.zoomLevels = [0.5, 1.0, 1.5, 2.0];
    this.currentZoomIndex = 1; // 初始为 1.0
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化信号系统
    window.__signals__ = window.__signals__ || [];
    this.logSignal('scene_created', { zoom: 1.0 });

    // 绘制背景网格，方便观察缩放效果
    this.drawGrid();

    // 绘制一些参考物体
    this.drawReferenceObjects();

    // 显示缩放信息文本
    this.zoomText = this.add.text(16, 16, '', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.zoomText.setScrollFactor(0); // 固定在屏幕上，不随相机移动
    this.updateZoomText();

    // 显示提示信息
    const hintText = this.add.text(16, 60, 'Click to zoom in/out', {
      fontSize: '18px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    });
    hintText.setScrollFactor(0);

    // 添加鼠标点击事件
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.cycleZoom();
      }
    });

    // 显示当前缩放范围
    const rangeText = this.add.text(16, 100, 'Zoom Range: 0.5x - 2.0x', {
      fontSize: '16px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    });
    rangeText.setScrollFactor(0);
  }

  drawGrid() {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x333333, 0.8);

    // 绘制垂直线
    for (let x = 0; x <= 800; x += 50) {
      graphics.lineBetween(x, 0, x, 600);
    }

    // 绘制水平线
    for (let y = 0; y <= 600; y += 50) {
      graphics.lineBetween(0, y, 800, y);
    }

    // 绘制中心十字线（更粗）
    graphics.lineStyle(2, 0x666666, 1);
    graphics.lineBetween(400, 0, 400, 600);
    graphics.lineBetween(0, 300, 800, 300);

    graphics.strokePath();
  }

  drawReferenceObjects() {
    const graphics = this.add.graphics();

    // 中心圆
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(400, 300, 40);

    // 四角矩形
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(50, 50, 80, 60);
    graphics.fillRect(670, 50, 80, 60);
    graphics.fillRect(50, 490, 80, 60);
    graphics.fillRect(670, 490, 80, 60);

    // 添加一些文字标记
    const centerLabel = this.add.text(400, 300, 'CENTER', {
      fontSize: '20px',
      color: '#ffffff'
    });
    centerLabel.setOrigin(0.5);

    this.add.text(90, 80, 'TL', { fontSize: '16px', color: '#ffffff' }).setOrigin(0.5);
    this.add.text(710, 80, 'TR', { fontSize: '16px', color: '#ffffff' }).setOrigin(0.5);
    this.add.text(90, 520, 'BL', { fontSize: '16px', color: '#ffffff' }).setOrigin(0.5);
    this.add.text(710, 520, 'BR', { fontSize: '16px', color: '#ffffff' }).setOrigin(0.5);

    // 添加一些装饰性三角形
    graphics.fillStyle(0x0000ff, 0.7);
    graphics.fillTriangle(200, 200, 250, 200, 225, 150);
    graphics.fillTriangle(550, 400, 600, 400, 575, 450);
  }

  cycleZoom() {
    // 切换到下一个缩放级别
    this.currentZoomIndex = (this.currentZoomIndex + 1) % this.zoomLevels.length;
    const newZoom = this.zoomLevels[this.currentZoomIndex];

    // 应用缩放
    this.cameras.main.setZoom(newZoom);

    // 更新显示
    this.updateZoomText();

    // 记录信号
    this.logSignal('zoom_changed', {
      zoom: newZoom,
      index: this.currentZoomIndex,
      timestamp: Date.now()
    });

    // 控制台输出
    console.log(`[Zoom] Changed to ${newZoom}x`);
  }

  updateZoomText() {
    const currentZoom = this.zoomLevels[this.currentZoomIndex];
    this.zoomText.setText(`Zoom: ${currentZoom.toFixed(1)}x`);
  }

  logSignal(event, data) {
    const signal = {
      event: event,
      data: data,
      scene: 'ZoomScene'
    };
    window.__signals__.push(signal);
    console.log('[SIGNAL]', JSON.stringify(signal));
  }

  update(time, delta) {
    // 可以在这里添加动画效果（可选）
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a1a',
  scene: ZoomScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态访问接口
window.getGameState = function() {
  return {
    currentZoom: game.scene.scenes[0].zoomLevels[game.scene.scenes[0].currentZoomIndex],
    zoomIndex: game.scene.scenes[0].currentZoomIndex,
    zoomLevels: game.scene.scenes[0].zoomLevels,
    signals: window.__signals__
  };
};

console.log('[Game] Camera zoom demo initialized. Click to cycle zoom levels.');
console.log('[Game] Access state via window.getGameState()');