class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.zoomComplete = false; // 状态信号：缩放是否完成
    this.currentZoom = 0.1; // 当前缩放值
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建背景
    const bgGraphics = this.add.graphics();
    bgGraphics.fillStyle(0x1a1a2e, 1);
    bgGraphics.fillRect(0, 0, width, height);

    // 创建网格作为缩放参照
    const gridGraphics = this.add.graphics();
    gridGraphics.lineStyle(2, 0x16213e, 0.5);
    
    // 绘制垂直线
    for (let x = 0; x <= width; x += 50) {
      gridGraphics.lineBetween(x, 0, x, height);
    }
    
    // 绘制水平线
    for (let y = 0; y <= height; y += 50) {
      gridGraphics.lineBetween(0, y, width, y);
    }

    // 创建中心圆形作为焦点
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xff6b6b, 1);
    centerGraphics.fillCircle(width / 2, height / 2, 80);
    
    centerGraphics.fillStyle(0xffffff, 1);
    centerGraphics.fillCircle(width / 2, height / 2, 60);
    
    centerGraphics.fillStyle(0x4ecdc4, 1);
    centerGraphics.fillCircle(width / 2, height / 2, 40);

    // 创建四角装饰方块
    const decorGraphics = this.add.graphics();
    decorGraphics.fillStyle(0xffe66d, 1);
    decorGraphics.fillRect(50, 50, 60, 60);
    decorGraphics.fillRect(width - 110, 50, 60, 60);
    decorGraphics.fillRect(50, height - 110, 60, 60);
    decorGraphics.fillRect(width - 110, height - 110, 60, 60);

    // 添加文本提示
    const titleText = this.add.text(width / 2, height / 2 - 150, 'ZOOM IN EFFECT', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    titleText.setOrigin(0.5);

    const statusText = this.add.text(width / 2, height / 2 + 150, 'Zooming...', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#4ecdc4'
    });
    statusText.setOrigin(0.5);

    // 获取主摄像机
    const camera = this.cameras.main;
    
    // 设置初始缩放值
    camera.setZoom(0.1);
    this.currentZoom = 0.1;

    // 创建缩放动画
    this.tweens.add({
      targets: camera,
      zoom: 1.0, // 目标缩放值
      duration: 2000, // 持续2秒
      ease: 'Cubic.easeOut', // 缓动函数
      onUpdate: (tween) => {
        // 更新当前缩放值
        this.currentZoom = camera.zoom;
        statusText.setText(`Zooming... ${Math.floor(camera.zoom * 100)}%`);
      },
      onComplete: () => {
        // 缩放完成
        this.zoomComplete = true;
        this.currentZoom = 1.0;
        statusText.setText('Zoom Complete!');
        statusText.setColor('#ffe66d');
        
        // 添加完成后的脉冲效果
        this.tweens.add({
          targets: centerGraphics,
          scaleX: 1.2,
          scaleY: 1.2,
          duration: 500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    });

    // 添加调试信息显示
    const debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 更新调试信息
    this.time.addEvent({
      delay: 100,
      callback: () => {
        debugText.setText([
          `Zoom: ${this.currentZoom.toFixed(3)}`,
          `Complete: ${this.zoomComplete}`,
          `Time: ${Math.floor(this.time.now / 1000)}s`
        ]);
      },
      loop: true
    });
  }

  update(time, delta) {
    // 可以在这里添加其他更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: GameScene,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

// 创建游戏实例
new Phaser.Game(config);