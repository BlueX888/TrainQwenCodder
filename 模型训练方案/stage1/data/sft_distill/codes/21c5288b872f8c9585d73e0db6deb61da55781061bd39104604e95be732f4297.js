class BounceScene extends Phaser.Scene {
  constructor() {
    super('BounceScene');
    this.bounceObjects = [];
    this.tweens = [];
    this.animationState = 'idle';
    this.completedCount = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      animationState: 'idle',
      objectCount: 0,
      isAnimating: false,
      completedCount: 0,
      duration: 0
    };

    // 使用 Graphics 生成圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(25, 25, 25);
    graphics.generateTexture('bounceCircle', 50, 50);
    graphics.destroy();

    // 创建10个物体并水平排列
    const startX = 100;
    const spacing = 60;
    const startY = 300;

    for (let i = 0; i < 10; i++) {
      const obj = this.add.sprite(startX + i * spacing, startY, 'bounceCircle');
      obj.setTint(Phaser.Display.Color.HSVToRGB(i / 10, 1, 1).color);
      this.bounceObjects.push(obj);
    }

    // 更新信号
    window.__signals__.objectCount = this.bounceObjects.length;

    // 添加标题文本
    this.add.text(400, 50, '10 Objects Synchronized Bounce', {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // 添加状态文本
    this.statusText = this.add.text(400, 100, 'Status: Ready', {
      fontSize: '18px',
      color: '#ffff00',
      align: 'center'
    }).setOrigin(0.5);

    // 添加计时器文本
    this.timerText = this.add.text(400, 130, 'Time: 0.00s', {
      fontSize: '18px',
      color: '#00ffff',
      align: 'center'
    }).setOrigin(0.5);

    // 启动同步弹跳动画
    this.startBounceAnimation();

    // 3秒后停止动画
    this.time.delayedCall(3000, () => {
      this.stopBounceAnimation();
    });

    // 记录开始时间
    this.startTime = this.time.now;
  }

  startBounceAnimation() {
    this.animationState = 'animating';
    window.__signals__.isAnimating = true;
    window.__signals__.animationState = 'animating';

    this.statusText.setText('Status: Bouncing...');

    // 为每个物体创建同步的弹跳 Tween
    this.bounceObjects.forEach((obj, index) => {
      const tween = this.tweens.add({
        targets: obj,
        y: obj.y - 150, // 向上弹跳150像素
        duration: 500, // 单次弹跳持续时间
        ease: 'Sine.easeInOut',
        yoyo: true, // 自动返回原位置
        repeat: -1, // 无限重复
        onRepeat: () => {
          // 每次完成一个完整弹跳循环
          this.completedCount++;
          window.__signals__.completedCount = this.completedCount;
        }
      });

      this.tweens.push(tween);
    });

    console.log(JSON.stringify({
      event: 'animation_started',
      objectCount: 10,
      timestamp: Date.now()
    }));
  }

  stopBounceAnimation() {
    this.animationState = 'stopped';
    window.__signals__.isAnimating = false;
    window.__signals__.animationState = 'stopped';

    this.statusText.setText('Status: Stopped');
    this.statusText.setColor('#ff0000');

    // 停止所有 Tween 动画
    this.tweens.forEach(tween => {
      tween.stop();
    });

    // 将所有物体平滑移回初始Y位置
    this.bounceObjects.forEach(obj => {
      this.tweens.add({
        targets: obj,
        y: 300,
        duration: 300,
        ease: 'Power2'
      });
    });

    console.log(JSON.stringify({
      event: 'animation_stopped',
      totalBounces: this.completedCount,
      duration: 3000,
      timestamp: Date.now()
    }));

    // 最终信号
    window.__signals__.finalStatus = 'completed';
    window.__signals__.totalDuration = 3000;
  }

  update(time, delta) {
    // 更新计时器显示
    if (this.animationState === 'animating') {
      const elapsed = (time - this.startTime) / 1000;
      this.timerText.setText(`Time: ${elapsed.toFixed(2)}s / 3.00s`);
      window.__signals__.duration = elapsed;

      // 确保不超过3秒
      if (elapsed >= 3.0 && this.animationState === 'animating') {
        this.stopBounceAnimation();
      }
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: BounceScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 初始化全局信号对象
window.__signals__ = {
  animationState: 'initializing',
  objectCount: 0,
  isAnimating: false,
  completedCount: 0,
  duration: 0
};