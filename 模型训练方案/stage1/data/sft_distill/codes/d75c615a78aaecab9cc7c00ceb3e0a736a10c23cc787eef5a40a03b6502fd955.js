class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.zoomCount = 0;
    this.isZooming = false;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化验证信号
    window.__signals__ = {
      zoomCount: 0,
      isZooming: false,
      lastZoomTime: null,
      zoomLevel: 1
    };

    // 绘制背景网格
    this.drawGrid();

    // 绘制中心标记
    this.drawCenterMarker();

    // 添加提示文本
    this.instructionText = this.add.text(400, 50, 'Press SPACE to trigger zoom', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setScrollFactor(0);

    // 状态显示文本
    this.statusText = this.add.text(400, 100, '', {
      fontSize: '20px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setScrollFactor(0);

    // 缩放次数显示
    this.countText = this.add.text(400, 550, 'Zoom Count: 0', {
      fontSize: '18px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setScrollFactor(0);

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    this.spaceKey.on('down', () => {
      this.triggerZoom();
    });

    // 获取主相机
    this.mainCamera = this.cameras.main;

    // 监听缩放完成事件
    this.mainCamera.on('camerazoomcomplete', () => {
      this.isZooming = false;
      window.__signals__.isZooming = false;
      this.statusText.setText('Zoom Complete!');
      
      console.log(JSON.stringify({
        event: 'zoom_complete',
        timestamp: Date.now(),
        finalZoom: this.mainCamera.zoom,
        totalZooms: this.zoomCount
      }));
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
    graphics.lineStyle(2, 0x666666, 1);
    graphics.lineBetween(400, 0, 400, 600);
    graphics.lineBetween(0, 300, 800, 300);
  }

  drawCenterMarker() {
    const graphics = this.add.graphics();
    
    // 绘制中心圆
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(400, 300, 10);

    // 绘制外圈
    graphics.lineStyle(2, 0xff0000, 1);
    graphics.strokeCircle(400, 300, 30);

    // 绘制四个角的方块
    const positions = [
      { x: 100, y: 100 },
      { x: 700, y: 100 },
      { x: 100, y: 500 },
      { x: 700, y: 500 }
    ];

    positions.forEach((pos, index) => {
      const color = [0x00ff00, 0x0000ff, 0xffff00, 0xff00ff][index];
      graphics.fillStyle(color, 1);
      graphics.fillRect(pos.x - 15, pos.y - 15, 30, 30);
    });
  }

  triggerZoom() {
    if (this.isZooming) {
      console.log(JSON.stringify({
        event: 'zoom_blocked',
        reason: 'already_zooming',
        timestamp: Date.now()
      }));
      return;
    }

    this.isZooming = true;
    this.zoomCount++;

    // 更新验证信号
    window.__signals__.zoomCount = this.zoomCount;
    window.__signals__.isZooming = true;
    window.__signals__.lastZoomTime = Date.now();

    // 更新显示
    this.countText.setText(`Zoom Count: ${this.zoomCount}`);
    this.statusText.setText('Zooming... (4 seconds)');

    // 交替缩放效果：奇数次放大，偶数次缩小
    const targetZoom = this.zoomCount % 2 === 1 ? 2 : 1;
    
    // 触发相机缩放效果，持续 4000 毫秒
    this.mainCamera.zoomTo(targetZoom, 4000);

    // 更新信号
    window.__signals__.zoomLevel = targetZoom;

    // 记录日志
    console.log(JSON.stringify({
      event: 'zoom_started',
      zoomCount: this.zoomCount,
      targetZoom: targetZoom,
      duration: 4000,
      timestamp: Date.now()
    }));
  }

  update(time, delta) {
    // 实时更新当前缩放级别显示
    if (this.isZooming) {
      const currentZoom = this.mainCamera.zoom.toFixed(2);
      window.__signals__.currentZoom = parseFloat(currentZoom);
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a1a',
  scene: GameScene,
  parent: 'game-container'
};

const game = new Phaser.Game(config);

// 初始化全局信号对象
window.__signals__ = {
  zoomCount: 0,
  isZooming: false,
  lastZoomTime: null,
  zoomLevel: 1,
  currentZoom: 1
};

console.log(JSON.stringify({
  event: 'game_initialized',
  timestamp: Date.now(),
  message: 'Press SPACE to trigger 4-second zoom effect'
}));