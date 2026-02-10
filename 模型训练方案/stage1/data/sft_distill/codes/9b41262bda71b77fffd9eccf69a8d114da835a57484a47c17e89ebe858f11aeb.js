class ShakeScene extends Phaser.Scene {
  constructor() {
    super('ShakeScene');
    this.shakeComplete = false; // 状态信号：抖动是否完成
    this.shakeStartTime = 0;    // 状态信号：抖动开始时间
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 记录抖动开始时间
    this.shakeStartTime = Date.now();

    // 创建背景网格，方便观察抖动效果
    const graphics = this.add.graphics();
    
    // 绘制网格背景
    graphics.lineStyle(2, 0x333333, 1);
    for (let x = 0; x < 800; x += 50) {
      graphics.lineBetween(x, 0, x, 600);
    }
    for (let y = 0; y < 600; y += 50) {
      graphics.lineBetween(0, y, 800, y);
    }

    // 绘制中心参照物
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xff6600, 1);
    centerGraphics.fillCircle(400, 300, 50);
    
    // 绘制边角参照物
    const cornerGraphics = this.add.graphics();
    cornerGraphics.fillStyle(0x00ff00, 1);
    cornerGraphics.fillRect(50, 50, 80, 80);
    cornerGraphics.fillRect(670, 50, 80, 80);
    cornerGraphics.fillRect(50, 470, 80, 80);
    cornerGraphics.fillRect(670, 470, 80, 80);

    // 添加标题文本
    const titleText = this.add.text(400, 150, 'Camera Shake Effect', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    titleText.setOrigin(0.5);

    // 添加状态文本
    this.statusText = this.add.text(400, 450, 'Shaking...', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffff00',
      stroke: '#000000',
      strokeThickness: 3
    });
    this.statusText.setOrigin(0.5);

    // 获取主相机
    const camera = this.cameras.main;

    // 启动相机抖动效果
    // 参数：持续时间(ms), 强度, 是否强制, 回调函数, 回调上下文
    camera.shake(500, 0.01);

    // 监听抖动完成事件
    camera.once('camerashakecomplete', () => {
      this.shakeComplete = true;
      const duration = Date.now() - this.shakeStartTime;
      
      this.statusText.setText(`Shake Complete! Duration: ${duration}ms`);
      this.statusText.setColor('#00ff00');
      
      console.log('Camera shake completed');
      console.log('Shake duration:', duration, 'ms');
      console.log('Shake complete status:', this.shakeComplete);
    });

    // 添加提示文本
    const hintText = this.add.text(400, 520, 'Watch the grid and shapes shake!', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#aaaaaa'
    });
    hintText.setOrigin(0.5);

    // 添加重启提示
    this.time.delayedCall(600, () => {
      const restartText = this.add.text(400, 550, 'Click to shake again', {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#ffffff',
        backgroundColor: '#333333',
        padding: { x: 10, y: 5 }
      });
      restartText.setOrigin(0.5);
      restartText.setInteractive();
      
      // 点击重新触发抖动
      restartText.on('pointerdown', () => {
        this.shakeComplete = false;
        this.shakeStartTime = Date.now();
        this.statusText.setText('Shaking...');
        this.statusText.setColor('#ffff00');
        
        camera.shake(500, 0.01);
        camera.once('camerashakecomplete', () => {
          this.shakeComplete = true;
          const duration = Date.now() - this.shakeStartTime;
          this.statusText.setText(`Shake Complete! Duration: ${duration}ms`);
          this.statusText.setColor('#00ff00');
        });
      });
    });
  }

  update(time, delta) {
    // 可以在这里添加其他更新逻辑
    // 抖动效果由相机系统自动处理
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: ShakeScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态信号供外部验证
if (typeof window !== 'undefined') {
  window.gameState = {
    getShakeStatus: () => {
      const scene = game.scene.getScene('ShakeScene');
      return {
        shakeComplete: scene ? scene.shakeComplete : false,
        shakeStartTime: scene ? scene.shakeStartTime : 0,
        elapsedTime: scene && scene.shakeStartTime > 0 
          ? Date.now() - scene.shakeStartTime 
          : 0
      };
    }
  };
}