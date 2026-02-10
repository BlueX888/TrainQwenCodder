class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 状态信号变量
    this.animationStatus = 'idle'; // idle, playing, stopped
    this.elapsedTime = 0;
    this.objectCount = 12;
    this.activeObjects = 0;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // 创建标题文本
    this.add.text(width / 2, 30, '12 Objects Fade Animation', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 状态显示文本
    this.statusText = this.add.text(width / 2, 60, '', {
      fontSize: '16px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 创建12个物体数组
    this.objects = [];
    this.tweens = [];
    
    // 网格布局：4列3行
    const cols = 4;
    const rows = 3;
    const spacing = 120;
    const startX = (width - (cols - 1) * spacing) / 2;
    const startY = (height - (rows - 1) * spacing) / 2 + 50;

    // 创建12个圆形物体
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = startX + col * spacing;
        const y = startY + row * spacing;
        
        // 使用Graphics绘制圆形
        const graphics = this.add.graphics();
        graphics.fillStyle(0x3498db, 1); // 蓝色
        graphics.fillCircle(0, 0, 30);
        graphics.x = x;
        graphics.y = y;
        
        // 添加编号文本
        const text = this.add.text(x, y, `${row * cols + col + 1}`, {
          fontSize: '20px',
          color: '#ffffff'
        }).setOrigin(0.5);
        
        this.objects.push({ graphics, text });
      }
    }

    this.activeObjects = this.objects.length;

    // 启动同步淡入淡出动画
    this.startFadeAnimation();

    // 4秒后停止动画
    this.time.delayedCall(4000, () => {
      this.stopFadeAnimation();
    });

    // 更新计时器
    this.time.addEvent({
      delay: 100,
      callback: this.updateStatus,
      callbackScope: this,
      loop: true
    });
  }

  startFadeAnimation() {
    this.animationStatus = 'playing';
    
    // 为所有物体创建同步的淡入淡出动画
    this.objects.forEach((obj, index) => {
      // Graphics的淡入淡出动画
      const tween = this.tweens.add({
        targets: obj.graphics,
        alpha: { from: 1, to: 0.1 },
        duration: 1000, // 1秒淡出
        yoyo: true, // 启用往返效果（淡入）
        repeat: -1, // 无限循环
        ease: 'Sine.easeInOut'
      });

      // 文本的淡入淡出动画（同步）
      this.tweens.add({
        targets: obj.text,
        alpha: { from: 1, to: 0.1 },
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      this.tweens.push(tween);
    });
  }

  stopFadeAnimation() {
    this.animationStatus = 'stopped';
    
    // 停止所有动画
    this.tweens.forEach(tween => {
      tween.stop();
    });

    // 恢复所有物体的完全不透明状态
    this.objects.forEach(obj => {
      obj.graphics.setAlpha(1);
      obj.text.setAlpha(1);
    });
  }

  updateStatus() {
    if (this.animationStatus === 'playing') {
      this.elapsedTime += 0.1;
    }

    const timeLeft = Math.max(0, 4 - this.elapsedTime).toFixed(1);
    
    this.statusText.setText(
      `Status: ${this.animationStatus.toUpperCase()} | ` +
      `Objects: ${this.activeObjects} | ` +
      `Elapsed: ${this.elapsedTime.toFixed(1)}s | ` +
      `Time Left: ${timeLeft}s`
    );

    // 根据状态改变文本颜色
    if (this.animationStatus === 'playing') {
      this.statusText.setColor('#00ff00'); // 绿色
    } else if (this.animationStatus === 'stopped') {
      this.statusText.setColor('#ff0000'); // 红色
    }
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
  backgroundColor: '#2c3e50',
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);