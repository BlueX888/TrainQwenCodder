class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.zoomCount = 0;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化全局信号对象
    window.__signals__ = {
      zoomCount: 0,
      currentZoom: 1,
      isZooming: false
    };

    // 创建一些背景元素用于观察缩放效果
    const graphics = this.add.graphics();
    
    // 绘制网格背景
    graphics.lineStyle(1, 0x00ff00, 0.5);
    for (let x = 0; x <= 800; x += 50) {
      graphics.lineBetween(x, 0, x, 600);
    }
    for (let y = 0; y <= 600; y += 50) {
      graphics.lineBetween(0, y, 800, y);
    }

    // 绘制中心参考点
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(400, 300, 20);

    // 添加文本提示
    const text = this.add.text(400, 50, 'Right Click to Zoom', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    text.setOrigin(0.5);

    // 显示缩放次数的文本
    this.zoomText = this.add.text(400, 100, 'Zoom Count: 0', {
      fontSize: '20px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.zoomText.setOrigin(0.5);

    // 获取主相机
    this.mainCamera = this.cameras.main;

    // 监听鼠标右键点击事件
    this.input.on('pointerdown', (pointer) => {
      // 检查是否为右键（button === 2）
      if (pointer.rightButtonDown()) {
        this.handleRightClick();
      }
    });

    // 禁用浏览器右键菜单
    this.input.mouse.disableContextMenu();

    console.log(JSON.stringify({
      event: 'scene_created',
      timestamp: Date.now(),
      initialZoom: this.mainCamera.zoom
    }));
  }

  handleRightClick() {
    // 如果已经在缩放中，忽略新的点击
    if (window.__signals__.isZooming) {
      return;
    }

    // 更新缩放计数
    this.zoomCount++;
    window.__signals__.zoomCount = this.zoomCount;
    window.__signals__.isZooming = true;

    // 更新显示文本
    this.zoomText.setText(`Zoom Count: ${this.zoomCount}`);

    // 计算目标缩放值（在 0.5 到 2.0 之间交替）
    const targetZoom = this.zoomCount % 2 === 1 ? 1.5 : 1.0;

    // 触发相机缩放效果，持续 1000ms
    this.mainCamera.zoomTo(targetZoom, 1000, 'Linear', false);

    // 记录缩放开始事件
    console.log(JSON.stringify({
      event: 'zoom_started',
      timestamp: Date.now(),
      zoomCount: this.zoomCount,
      fromZoom: this.mainCamera.zoom,
      toZoom: targetZoom,
      duration: 1000
    }));

    // 1秒后重置缩放状态
    this.time.delayedCall(1000, () => {
      window.__signals__.isZooming = false;
      window.__signals__.currentZoom = this.mainCamera.zoom;

      console.log(JSON.stringify({
        event: 'zoom_completed',
        timestamp: Date.now(),
        zoomCount: this.zoomCount,
        finalZoom: this.mainCamera.zoom
      }));
    });
  }

  update(time, delta) {
    // 实时更新当前缩放值到 signals
    window.__signals__.currentZoom = this.mainCamera.zoom;
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

// 创建游戏实例
new Phaser.Game(config);