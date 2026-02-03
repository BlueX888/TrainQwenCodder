class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 状态信号变量
    this.zoomComplete = false;
    this.zoomProgress = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建背景网格以便观察缩放效果
    const graphics = this.add.graphics();
    
    // 绘制网格背景
    graphics.lineStyle(2, 0x00ff00, 0.5);
    for (let x = 0; x <= 800; x += 50) {
      graphics.lineBetween(x, 0, x, 600);
    }
    for (let y = 0; y <= 600; y += 50) {
      graphics.lineBetween(0, y, 800, y);
    }

    // 绘制中心标记
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(400, 300, 30);
    
    // 添加文本
    const text = this.add.text(400, 300, 'ZOOM EFFECT', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    text.setOrigin(0.5);

    // 添加四角的参考点
    graphics.fillStyle(0x0000ff, 1);
    graphics.fillCircle(100, 100, 20);
    graphics.fillCircle(700, 100, 20);
    graphics.fillCircle(100, 500, 20);
    graphics.fillCircle(700, 500, 20);

    // 获取主相机
    const camera = this.cameras.main;
    
    // 设置相机初始缩放为0.5（场景看起来更小）
    camera.setZoom(0.5);

    // 方法1：使用 Camera.zoomTo 方法（推荐）
    // 参数：目标缩放值, 持续时间(毫秒), 缓动类型, 强制, 回调, 回调上下文
    camera.zoomTo(1.0, 1000, 'Sine.easeInOut', false, (cam, progress) => {
      // 更新进度状态
      this.zoomProgress = progress;
      
      // 当进度达到1时标记完成
      if (progress === 1) {
        this.zoomComplete = true;
        console.log('Zoom effect complete!');
      }
    });

    // 添加状态显示文本
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setScrollFactor(0); // 固定在屏幕上不随相机移动

    // 可选方法2：使用 Tweens（注释掉，可替换使用）
    /*
    this.tweens.add({
      targets: camera,
      zoom: 1.0,
      duration: 1000,
      ease: 'Sine.easeInOut',
      onUpdate: (tween) => {
        this.zoomProgress = tween.progress;
      },
      onComplete: () => {
        this.zoomComplete = true;
        console.log('Zoom effect complete via Tween!');
      }
    });
    */
  }

  update(time, delta) {
    // 更新状态显示
    this.statusText.setText([
      `Zoom Progress: ${(this.zoomProgress * 100).toFixed(1)}%`,
      `Zoom Complete: ${this.zoomComplete}`,
      `Current Zoom: ${this.cameras.main.zoom.toFixed(2)}`,
      `Time: ${(time / 1000).toFixed(1)}s`
    ]);
  }
}

// Phaser游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);