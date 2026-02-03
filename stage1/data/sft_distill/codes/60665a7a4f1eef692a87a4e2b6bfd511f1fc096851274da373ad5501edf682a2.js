// 完整的 Phaser3 场景抖动效果代码
class ShakeScene extends Phaser.Scene {
  constructor() {
    super('ShakeScene');
    // 状态信号变量
    this.isShaking = false;
    this.shakeCompleted = false;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建背景
    const graphics = this.add.graphics();
    graphics.fillStyle(0x1a1a2e, 1);
    graphics.fillRect(0, 0, 800, 600);

    // 创建网格作为抖动参照物
    graphics.lineStyle(2, 0x16213e, 1);
    for (let x = 0; x <= 800; x += 50) {
      graphics.lineBetween(x, 0, x, 600);
    }
    for (let y = 0; y <= 600; y += 50) {
      graphics.lineBetween(0, y, 800, y);
    }

    // 创建中心标记物
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xff6b6b, 1);
    centerGraphics.fillCircle(400, 300, 40);
    
    centerGraphics.fillStyle(0xffffff, 1);
    centerGraphics.fillCircle(400, 300, 30);
    
    centerGraphics.fillStyle(0xff6b6b, 1);
    centerGraphics.fillCircle(400, 300, 20);

    // 创建四角标记
    const cornerSize = 30;
    const cornerGraphics = this.add.graphics();
    cornerGraphics.fillStyle(0x4ecdc4, 1);
    
    // 左上角
    cornerGraphics.fillRect(20, 20, cornerSize, cornerSize);
    // 右上角
    cornerGraphics.fillRect(750, 20, cornerSize, cornerSize);
    // 左下角
    cornerGraphics.fillRect(20, 550, cornerSize, cornerSize);
    // 右下角
    cornerGraphics.fillRect(750, 550, cornerSize, cornerSize);

    // 添加文字提示
    const text = this.add.text(400, 450, 'Camera Shake Effect', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    text.setOrigin(0.5);

    const statusText = this.add.text(400, 500, 'Shaking...', {
      fontSize: '24px',
      color: '#4ecdc4',
      fontFamily: 'Arial'
    });
    statusText.setOrigin(0.5);

    // 获取主相机并触发抖动效果
    const camera = this.cameras.main;
    
    // 设置状态为正在抖动
    this.isShaking = true;
    
    // 触发抖动效果
    // 参数：持续时间(ms), 抖动强度, 是否强制抖动, 回调函数, 回调上下文
    camera.shake(500, 0.01);

    // 监听抖动完成事件
    camera.once('camerashakecomplete', () => {
      this.isShaking = false;
      this.shakeCompleted = true;
      statusText.setText('Shake Completed!');
      statusText.setColor('#00ff00');
      
      console.log('Camera shake completed');
      console.log('Status - isShaking:', this.isShaking, 'shakeCompleted:', this.shakeCompleted);
    });

    // 输出初始状态
    console.log('Camera shake started');
    console.log('Status - isShaking:', this.isShaking, 'shakeCompleted:', this.shakeCompleted);

    // 添加重复抖动的交互
    this.input.on('pointerdown', () => {
      if (!this.isShaking) {
        this.isShaking = true;
        this.shakeCompleted = false;
        statusText.setText('Shaking...');
        statusText.setColor('#4ecdc4');
        
        camera.shake(500, 0.01);
        console.log('Manual shake triggered');
      }
    });

    // 添加提示文字
    const hintText = this.add.text(400, 550, 'Click to shake again', {
      fontSize: '18px',
      color: '#888888',
      fontFamily: 'Arial'
    });
    hintText.setOrigin(0.5);
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
  backgroundColor: '#000000',
  scene: ShakeScene,
  // 如果需要在无头模式运行，可以改为 Phaser.HEADLESS
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);