class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 状态信号：缩放是否完成
    this.zoomComplete = false;
    this.zoomProgress = 0;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建背景
    const bgGraphics = this.add.graphics();
    bgGraphics.fillStyle(0x1a1a2e, 1);
    bgGraphics.fillRect(0, 0, width, height);

    // 创建中心装饰圆形
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0x16213e, 1);
    centerGraphics.fillCircle(width / 2, height / 2, 150);
    
    // 添加内圈
    centerGraphics.fillStyle(0x0f3460, 1);
    centerGraphics.fillCircle(width / 2, height / 2, 100);
    
    // 添加核心
    centerGraphics.fillStyle(0xe94560, 1);
    centerGraphics.fillCircle(width / 2, height / 2, 50);

    // 添加装饰矩形
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i;
      const x = width / 2 + Math.cos(angle) * 200;
      const y = height / 2 + Math.sin(angle) * 200;
      
      const rectGraphics = this.add.graphics();
      rectGraphics.fillStyle(0x53a8b6, 1);
      rectGraphics.fillRect(x - 20, y - 20, 40, 40);
    }

    // 添加标题文字
    const titleText = this.add.text(width / 2, height / 2 - 250, 'ZOOM EFFECT', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    titleText.setOrigin(0.5);

    // 添加状态显示文字
    this.statusText = this.add.text(width / 2, height / 2 + 200, 'Zooming In...', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#e94560'
    });
    this.statusText.setOrigin(0.5);

    // 添加进度显示文字
    this.progressText = this.add.text(width / 2, height / 2 + 240, 'Progress: 0%', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#53a8b6'
    });
    this.progressText.setOrigin(0.5);

    // 获取主相机
    const camera = this.cameras.main;

    // 设置初始缩放为极小值
    camera.setZoom(0.1);

    // 使用 zoomTo 方法实现缩放效果
    // 参数：目标缩放值, 持续时间(ms), 缓动函数, 强制立即执行, 完成回调, 上下文
    camera.zoomTo(1.0, 2000, 'Sine.easeInOut', false, (cam, progress) => {
      // 更新进度
      this.zoomProgress = Math.round(progress * 100);
      
      // 缩放完成回调
      if (progress === 1) {
        this.zoomComplete = true;
        this.statusText.setText('Zoom Complete!');
        this.statusText.setColor('#00ff00');
        
        // 添加完成后的闪烁效果
        this.tweens.add({
          targets: this.statusText,
          alpha: 0.3,
          duration: 500,
          yoyo: true,
          repeat: -1
        });

        console.log('Zoom effect completed!');
        console.log('zoomComplete status:', this.zoomComplete);
      }
    });

    // 添加说明文字
    const instructionText = this.add.text(20, height - 40, 
      'Scene zoom effect: 0.1x → 1.0x over 2 seconds', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#888888'
    });

    // 输出初始状态
    console.log('Initial zoom:', camera.zoom);
    console.log('Target zoom: 1.0');
    console.log('Duration: 2000ms');
    console.log('zoomComplete:', this.zoomComplete);
  }

  update() {
    // 更新进度显示
    if (!this.zoomComplete && this.progressText) {
      this.progressText.setText(`Progress: ${this.zoomProgress}%`);
    } else if (this.zoomComplete && this.progressText) {
      this.progressText.setText('Progress: 100% ✓');
      this.progressText.setColor('#00ff00');
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: GameScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 全局访问状态（用于验证）
window.getZoomStatus = function() {
  const scene = game.scene.scenes[0];
  return {
    zoomComplete: scene.zoomComplete,
    zoomProgress: scene.zoomProgress,
    currentZoom: scene.cameras.main.zoom
  };
};