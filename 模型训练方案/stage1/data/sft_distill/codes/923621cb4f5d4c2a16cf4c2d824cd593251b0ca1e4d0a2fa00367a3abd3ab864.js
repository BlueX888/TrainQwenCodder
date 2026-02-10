class ZoomScene extends Phaser.Scene {
  constructor() {
    super('ZoomScene');
    this.zoomLevels = [0.5, 1.0, 1.5, 2.0];
    this.currentZoomIndex = 1; // 初始缩放为 1.0
    this.currentZoom = 1.0;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 绘制网格背景（用于观察缩放效果）
    this.drawGrid();

    // 绘制一些参考对象
    this.drawReferenceObjects();

    // 创建缩放提示文本
    this.zoomText = this.add.text(10, 10, `Zoom: ${this.currentZoom}x`, {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.zoomText.setScrollFactor(0); // 固定在屏幕上，不受相机缩放影响

    // 创建操作提示
    this.helpText = this.add.text(10, 50, 'Press SPACE to zoom', {
      fontSize: '18px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.helpText.setScrollFactor(0);

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 防止连续触发
    this.canZoom = true;

    // 添加键盘事件监听
    this.spaceKey.on('down', () => {
      if (this.canZoom) {
        this.toggleZoom();
        this.canZoom = false;
        
        // 300ms 后才能再次触发
        this.time.delayedCall(300, () => {
          this.canZoom = true;
        });
      }
    });

    // 添加中心标记
    const centerX = width / 2;
    const centerY = height / 2;
    const centerGraphics = this.add.graphics();
    centerGraphics.lineStyle(3, 0xff0000);
    centerGraphics.strokeCircle(centerX, centerY, 10);
    centerGraphics.lineBetween(centerX - 20, centerY, centerX + 20, centerY);
    centerGraphics.lineBetween(centerX, centerY - 20, centerX, centerY + 20);
  }

  drawGrid() {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x333333, 0.5);

    const gridSize = 50;
    const { width, height } = this.cameras.main;

    // 绘制垂直线
    for (let x = 0; x <= width; x += gridSize) {
      graphics.lineBetween(x, 0, x, height);
    }

    // 绘制水平线
    for (let y = 0; y <= height; y += gridSize) {
      graphics.lineBetween(0, y, width, y);
    }
  }

  drawReferenceObjects() {
    const { width, height } = this.cameras.main;

    // 绘制四个角的方块
    const cornerSize = 40;
    const corners = [
      { x: 50, y: 50, color: 0xff0000 },
      { x: width - 50, y: 50, color: 0x00ff00 },
      { x: 50, y: height - 50, color: 0x0000ff },
      { x: width - 50, y: height - 50, color: 0xffff00 }
    ];

    corners.forEach(corner => {
      const graphics = this.add.graphics();
      graphics.fillStyle(corner.color, 1);
      graphics.fillRect(corner.x - cornerSize / 2, corner.y - cornerSize / 2, cornerSize, cornerSize);
    });

    // 绘制中心圆形
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xff00ff, 1);
    centerGraphics.fillCircle(width / 2, height / 2, 60);

    // 添加中心文字
    this.add.text(width / 2, height / 2, 'CENTER', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 绘制一些随机位置的小圆点
    for (let i = 0; i < 20; i++) {
      const dotGraphics = this.add.graphics();
      const x = Phaser.Math.Between(100, width - 100);
      const y = Phaser.Math.Between(100, height - 100);
      const color = Phaser.Display.Color.RandomRGB();
      dotGraphics.fillStyle(color.color, 1);
      dotGraphics.fillCircle(x, y, 15);
    }
  }

  toggleZoom() {
    // 切换到下一个缩放级别
    this.currentZoomIndex = (this.currentZoomIndex + 1) % this.zoomLevels.length;
    this.currentZoom = this.zoomLevels[this.currentZoomIndex];

    // 应用缩放
    this.cameras.main.setZoom(this.currentZoom);

    // 更新文本显示
    this.zoomText.setText(`Zoom: ${this.currentZoom}x`);

    // 添加视觉反馈
    this.tweens.add({
      targets: this.zoomText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Power2'
    });

    // 状态信号 - 用于验证
    console.log(`Camera zoom changed to: ${this.currentZoom}x`);
  }

  update(time, delta) {
    // 可以在这里添加持续的逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a1a',
  scene: ZoomScene,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 状态验证变量（全局访问）
window.getZoomState = function() {
  const scene = game.scene.scenes[0];
  return {
    currentZoom: scene.currentZoom,
    currentZoomIndex: scene.currentZoomIndex,
    zoomLevels: scene.zoomLevels,
    minZoom: Math.min(...scene.zoomLevels),
    maxZoom: Math.max(...scene.zoomLevels)
  };
};