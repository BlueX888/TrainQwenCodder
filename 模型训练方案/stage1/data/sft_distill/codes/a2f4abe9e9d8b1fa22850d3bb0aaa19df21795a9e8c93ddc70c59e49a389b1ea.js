class BounceScene extends Phaser.Scene {
  constructor() {
    super('BounceScene');
    this.animationStatus = 'running'; // 状态信号：running, stopped
    this.activeObjects = 15; // 活动物体数量
    this.bounceCount = 0; // 弹跳次数统计
  }

  preload() {
    // 创建圆形纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(25, 25, 25);
    graphics.generateTexture('ball', 50, 50);
    graphics.destroy();
  }

  create() {
    // 添加标题文本
    this.add.text(400, 50, '15个物体同步弹跳动画', {
      fontSize: '28px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // 添加状态显示文本
    this.statusText = this.add.text(400, 100, '', {
      fontSize: '20px',
      color: '#ffff00',
      align: 'center'
    }).setOrigin(0.5);

    // 创建15个物体数组
    this.objects = [];
    const rows = 3;
    const cols = 5;
    const startX = 200;
    const startY = 200;
    const spacingX = 100;
    const spacingY = 100;

    // 创建并排列15个物体
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = startX + col * spacingX;
        const y = startY + row * spacingY;
        
        // 创建精灵对象
        const ball = this.add.sprite(x, y, 'ball');
        ball.initialY = y; // 记录初始Y位置
        this.objects.push(ball);
      }
    }

    // 创建同步弹跳动画
    this.tweens = [];
    this.objects.forEach((ball, index) => {
      const tween = this.tweens.add({
        targets: ball,
        y: ball.initialY - 80, // 向上弹跳80像素
        duration: 400, // 单次弹跳持续400ms
        ease: 'Quad.easeInOut',
        yoyo: true, // 返回原位置
        repeat: -1, // 无限重复
        onRepeat: () => {
          // 只在第一个物体上统计弹跳次数
          if (index === 0) {
            this.bounceCount++;
          }
        }
      });
      this.tweens.push(tween);
    });

    // 2秒后停止所有动画
    this.time.delayedCall(2000, () => {
      this.stopAllAnimations();
    });

    // 更新状态显示
    this.updateStatus();
  }

  update() {
    // 实时更新状态显示
    this.updateStatus();
  }

  updateStatus() {
    if (this.statusText) {
      this.statusText.setText(
        `状态: ${this.animationStatus === 'running' ? '运行中' : '已停止'} | ` +
        `活动物体: ${this.activeObjects} | ` +
        `弹跳次数: ${this.bounceCount}`
      );
    }
  }

  stopAllAnimations() {
    // 停止所有缓动动画
    this.tweens.forEach(tween => {
      tween.stop();
    });

    // 将所有物体恢复到初始位置
    this.objects.forEach(ball => {
      this.tweens.add({
        targets: ball,
        y: ball.initialY,
        duration: 200,
        ease: 'Quad.easeOut'
      });
    });

    // 更新状态
    this.animationStatus = 'stopped';
    this.activeObjects = 0;

    // 添加完成提示
    this.add.text(400, 550, '动画已停止！', {
      fontSize: '24px',
      color: '#ff0000',
      align: 'center'
    }).setOrigin(0.5);

    console.log('所有动画已停止');
    console.log('总弹跳次数:', this.bounceCount);
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