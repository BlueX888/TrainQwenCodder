class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.zoomCount = 0;
    this.isZooming = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化 signals 用于验证
    window.__signals__ = {
      zoomCount: 0,
      isZooming: false,
      lastZoomTime: 0
    };

    // 创建背景网格，用于观察缩放效果
    const graphics = this.add.graphics();
    
    // 绘制网格
    graphics.lineStyle(1, 0x00ff00, 0.3);
    for (let x = 0; x <= 800; x += 50) {
      graphics.lineBetween(x, 0, x, 600);
    }
    for (let y = 0; y <= 600; y += 50) {
      graphics.lineBetween(0, y, 800, y);
    }

    // 绘制中心标记
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(400, 300, 20);
    
    // 绘制一些装饰方块
    graphics.fillStyle(0x00ffff, 0.6);
    graphics.fillRect(200, 150, 100, 100);
    graphics.fillRect(500, 350, 100, 100);
    
    graphics.fillStyle(0xffff00, 0.6);
    graphics.fillRect(100, 400, 80, 80);
    graphics.fillRect(600, 100, 80, 80);

    // 添加提示文本
    const text = this.add.text(400, 50, '右键点击触发缩放效果', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    text.setOrigin(0.5);

    // 状态文本
    this.statusText = this.add.text(400, 550, '缩放次数: 0', {
      fontSize: '20px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setOrigin(0.5);
    this.statusText.setScrollFactor(0); // 固定在屏幕上

    // 获取主相机
    this.camera = this.cameras.main;

    // 监听鼠标右键点击事件
    this.input.on('pointerdown', (pointer) => {
      // 检查是否是右键
      if (pointer.rightButtonDown()) {
        this.triggerZoomEffect();
      }
    });

    // 启用右键上下文菜单禁用（可选，提升体验）
    this.input.mouse.disableContextMenu();

    console.log('游戏初始化完成，右键点击触发缩放效果');
  }

  triggerZoomEffect() {
    // 如果正在缩放中，忽略新的触发
    if (this.isZooming) {
      console.log('缩放进行中，忽略本次触发');
      return;
    }

    this.isZooming = true;
    this.zoomCount++;

    // 更新 signals
    window.__signals__.zoomCount = this.zoomCount;
    window.__signals__.isZooming = true;
    window.__signals__.lastZoomTime = Date.now();

    // 更新状态文本
    this.statusText.setText(`缩放次数: ${this.zoomCount} (缩放中...)`);

    // 记录原始缩放值
    const originalZoom = this.camera.zoom;

    // 触发缩放效果：放大到 1.5 倍
    this.camera.zoomTo(1.5, 1000, 'Power2', false);

    console.log(JSON.stringify({
      event: 'zoom_triggered',
      zoomCount: this.zoomCount,
      originalZoom: originalZoom,
      targetZoom: 1.5,
      duration: 1000,
      timestamp: Date.now()
    }));

    // 1 秒后恢复原始缩放
    this.time.delayedCall(1000, () => {
      this.camera.zoomTo(originalZoom, 1000, 'Power2', false);
      
      // 再等 1 秒后标记缩放完成
      this.time.delayedCall(1000, () => {
        this.isZooming = false;
        window.__signals__.isZooming = false;
        this.statusText.setText(`缩放次数: ${this.zoomCount}`);
        
        console.log(JSON.stringify({
          event: 'zoom_completed',
          zoomCount: this.zoomCount,
          finalZoom: this.camera.zoom,
          timestamp: Date.now()
        }));
      });
    });
  }

  update(time, delta) {
    // 可以在这里添加实时更新逻辑（本例不需要）
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

// 启动游戏
const game = new Phaser.Game(config);