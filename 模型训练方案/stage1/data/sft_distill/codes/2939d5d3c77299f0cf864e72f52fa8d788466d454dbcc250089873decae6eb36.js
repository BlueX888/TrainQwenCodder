// 场景闪烁效果实现
class FlashScene extends Phaser.Scene {
  constructor() {
    super('FlashScene');
    this.flashComplete = false;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 初始化验证信号对象
    window.__signals__ = {
      flashStarted: false,
      flashComplete: false,
      flashDuration: 500,
      timestamp: Date.now()
    };

    // 创建背景 - 使用深蓝色
    const bgGraphics = this.add.graphics();
    bgGraphics.fillStyle(0x1a1a2e, 1);
    bgGraphics.fillRect(0, 0, 800, 600);

    // 创建一些游戏对象以便观察闪烁效果
    // 创建中心圆形
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xff6b6b, 1);
    centerGraphics.fillCircle(400, 300, 80);

    // 创建四个角落的矩形
    const corners = [
      { x: 100, y: 100, color: 0x4ecdc4 },
      { x: 700, y: 100, color: 0xffe66d },
      { x: 100, y: 500, color: 0x95e1d3 },
      { x: 700, y: 500, color: 0xf38181 }
    ];

    corners.forEach(corner => {
      const graphics = this.add.graphics();
      graphics.fillStyle(corner.color, 1);
      graphics.fillRect(corner.x - 40, corner.y - 40, 80, 80);
    });

    // 添加状态文本
    this.statusText = this.add.text(400, 50, '闪烁中...', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });
    this.statusText.setOrigin(0.5);

    // 添加计时器文本
    this.timerText = this.add.text(400, 550, '时间: 0ms', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial'
    });
    this.timerText.setOrigin(0.5);

    // 获取主摄像机
    const camera = this.cameras.main;

    // 记录闪烁开始
    window.__signals__.flashStarted = true;
    const startTime = Date.now();

    console.log(JSON.stringify({
      event: 'flash_started',
      timestamp: startTime,
      duration: 500
    }));

    // 执行闪烁效果
    // flash(duration, red, green, blue, force, callback, context)
    // 参数：持续时间(ms), 红色值, 绿色值, 蓝色值, 是否强制, 回调函数, 上下文
    camera.flash(500, 255, 255, 255, false, (cam, progress) => {
      // 闪烁完成回调
      if (progress === 1) {
        this.flashComplete = true;
        window.__signals__.flashComplete = true;
        window.__signals__.completedAt = Date.now();
        window.__signals__.actualDuration = Date.now() - startTime;

        this.statusText.setText('闪烁完成！');
        this.statusText.setColor('#00ff00');

        console.log(JSON.stringify({
          event: 'flash_completed',
          timestamp: Date.now(),
          actualDuration: window.__signals__.actualDuration
        }));

        // 3秒后重新开始闪烁
        this.time.delayedCall(3000, () => {
          this.restartFlash();
        });
      }
    });

    // 创建计时器用于显示闪烁进度
    this.startTime = Date.now();
    this.flashTimer = this.time.addEvent({
      delay: 16, // 约60fps
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });
  }

  updateTimer() {
    const elapsed = Date.now() - this.startTime;
    this.timerText.setText(`时间: ${elapsed}ms`);

    // 如果闪烁完成，停止计时器
    if (this.flashComplete && elapsed > 500) {
      this.flashTimer.remove();
    }
  }

  restartFlash() {
    // 重置状态
    this.flashComplete = false;
    this.startTime = Date.now();
    
    window.__signals__.flashStarted = true;
    window.__signals__.flashComplete = false;
    window.__signals__.restartCount = (window.__signals__.restartCount || 0) + 1;

    this.statusText.setText('闪烁中...');
    this.statusText.setColor('#ffffff');

    console.log(JSON.stringify({
      event: 'flash_restarted',
      timestamp: Date.now(),
      restartCount: window.__signals__.restartCount
    }));

    // 重新开始计时
    this.flashTimer = this.time.addEvent({
      delay: 16,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });

    // 执行新的闪烁
    const camera = this.cameras.main;
    const startTime = Date.now();
    
    camera.flash(500, 255, 255, 255, false, (cam, progress) => {
      if (progress === 1) {
        this.flashComplete = true;
        window.__signals__.flashComplete = true;
        window.__signals__.completedAt = Date.now();
        window.__signals__.actualDuration = Date.now() - startTime;

        this.statusText.setText('闪烁完成！');
        this.statusText.setColor('#00ff00');

        console.log(JSON.stringify({
          event: 'flash_completed',
          timestamp: Date.now(),
          actualDuration: window.__signals__.actualDuration
        }));

        // 继续循环
        this.time.delayedCall(3000, () => {
          this.restartFlash();
        });
      }
    });
  }

  update(time, delta) {
    // 每帧更新逻辑（如需要）
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: FlashScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 输出初始验证信号
console.log(JSON.stringify({
  event: 'game_initialized',
  timestamp: Date.now(),
  config: {
    width: config.width,
    height: config.height,
    scene: 'FlashScene'
  }
}));