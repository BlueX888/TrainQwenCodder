class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.isPaused = false;
    this.frameCount = 0;
    this.pauseCount = 0;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      isPaused: false,
      frameCount: 0,
      pauseCount: 0,
      resumeCount: 0,
      clicks: []
    };

    // 创建移动的游戏对象（用于验证暂停效果）
    this.createMovingObjects();

    // 创建暂停覆盖层（初始隐藏）
    this.createPauseOverlay();

    // 添加鼠标左键点击事件
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.togglePause();
        
        // 记录点击信号
        window.__signals__.clicks.push({
          time: this.time.now,
          x: pointer.x,
          y: pointer.y,
          isPaused: this.isPaused
        });
      }
    });

    // 添加提示文本
    this.add.text(10, 10, 'Click left mouse button to pause/resume', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });

    // 添加状态显示文本
    this.statusText = this.add.text(10, 40, '', {
      fontSize: '14px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });

    console.log('[GameScene] Created - Game ready');
  }

  createMovingObjects() {
    // 创建多个移动的方块，用于验证暂停效果
    this.movingObjects = [];

    for (let i = 0; i < 5; i++) {
      const graphics = this.add.graphics();
      const color = Phaser.Display.Color.HSVToRGB(i * 0.2, 1, 1).color;
      
      graphics.fillStyle(color, 1);
      graphics.fillRect(-25, -25, 50, 50);
      
      const x = 100 + i * 150;
      const y = 200;
      graphics.setPosition(x, y);
      
      // 为每个对象添加速度属性
      graphics.setData('velocityX', (i % 2 === 0 ? 1 : -1) * (50 + i * 20));
      graphics.setData('velocityY', (i % 2 === 0 ? 1 : -1) * (30 + i * 10));
      
      this.movingObjects.push(graphics);
    }

    console.log('[GameScene] Created 5 moving objects');
  }

  createPauseOverlay() {
    // 创建暂停覆盖层容器
    this.pauseOverlay = this.add.container(0, 0);

    // 创建黄色半透明背景
    const overlay = this.add.graphics();
    overlay.fillStyle(0xffff00, 0.7); // 黄色，70% 不透明度
    overlay.fillRect(0, 0, this.scale.width, this.scale.height);

    // 创建 "PAUSED" 文字
    const pausedText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2,
      'PAUSED',
      {
        fontSize: '72px',
        color: '#000000',
        fontStyle: 'bold',
        stroke: '#ffffff',
        strokeThickness: 4
      }
    );
    pausedText.setOrigin(0.5);

    // 创建提示文字
    const hintText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 + 80,
      'Click to resume',
      {
        fontSize: '24px',
        color: '#000000'
      }
    );
    hintText.setOrigin(0.5);

    // 将元素添加到容器
    this.pauseOverlay.add([overlay, pausedText, hintText]);

    // 设置覆盖层深度，确保在最上层
    this.pauseOverlay.setDepth(1000);

    // 初始隐藏
    this.pauseOverlay.setVisible(false);

    console.log('[GameScene] Pause overlay created');
  }

  togglePause() {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      // 暂停游戏
      this.pauseOverlay.setVisible(true);
      this.scene.pause();
      this.pauseCount++;
      
      window.__signals__.isPaused = true;
      window.__signals__.pauseCount = this.pauseCount;
      
      console.log(`[GameScene] PAUSED at frame ${this.frameCount} (pause count: ${this.pauseCount})`);
    } else {
      // 继续游戏
      this.pauseOverlay.setVisible(false);
      this.scene.resume();
      
      window.__signals__.isPaused = false;
      window.__signals__.resumeCount = this.pauseCount;
      
      console.log(`[GameScene] RESUMED at frame ${this.frameCount} (resume count: ${this.pauseCount})`);
    }
  }

  update(time, delta) {
    // 更新帧计数
    this.frameCount++;
    window.__signals__.frameCount = this.frameCount;

    // 更新移动对象
    this.movingObjects.forEach((obj, index) => {
      const vx = obj.getData('velocityX');
      const vy = obj.getData('velocityY');

      obj.x += vx * (delta / 1000);
      obj.y += vy * (delta / 1000);

      // 边界反弹
      if (obj.x < 25 || obj.x > this.scale.width - 25) {
        obj.setData('velocityX', -vx);
      }
      if (obj.y < 25 || obj.y > this.scale.height - 25) {
        obj.setData('velocityY', -vy);
      }
    });

    // 更新状态文本
    this.statusText.setText(
      `Frame: ${this.frameCount} | Pauses: ${this.pauseCount} | Status: ${this.isPaused ? 'PAUSED' : 'RUNNING'}`
    );

    // 每 60 帧输出一次日志
    if (this.frameCount % 60 === 0) {
      console.log(JSON.stringify({
        type: 'status',
        frame: this.frameCount,
        isPaused: this.isPaused,
        pauseCount: this.pauseCount,
        time: time
      }));
    }
  }
}

// Phaser 游戏配置
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

console.log('[Main] Phaser game initialized');
console.log('[Main] Click left mouse button to pause/resume the game');