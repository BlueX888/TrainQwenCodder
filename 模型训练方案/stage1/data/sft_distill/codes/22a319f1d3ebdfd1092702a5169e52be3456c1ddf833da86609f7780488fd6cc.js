class ShakeScene extends Phaser.Scene {
  constructor() {
    super('ShakeScene');
    this.animationStatus = 'running'; // 状态信号：running, stopped
    this.elapsedTime = 0; // 已运行时间
    this.shakeCount = 0; // 抖动次数计数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 创建标题文本
    this.add.text(width / 2, 50, '5个物体同步抖动动画', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 状态显示文本
    this.statusText = this.add.text(width / 2, 100, '', {
      fontSize: '18px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 创建5个不同颜色的方块
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
    this.boxes = [];
    this.tweens = [];

    const startX = 150;
    const spacing = 120;
    const centerY = height / 2;

    for (let i = 0; i < 5; i++) {
      // 使用 Graphics 创建方块并生成纹理
      const graphics = this.add.graphics();
      graphics.fillStyle(colors[i], 1);
      graphics.fillRect(0, 0, 80, 80);
      graphics.generateTexture(`box${i}`, 80, 80);
      graphics.destroy();

      // 创建精灵对象
      const box = this.add.sprite(startX + i * spacing, centerY, `box${i}`);
      box.setOrigin(0.5);
      
      // 保存初始位置
      box.initialX = box.x;
      box.initialY = box.y;
      
      this.boxes.push(box);

      // 创建抖动动画
      const shakeTween = this.tweens.add({
        targets: box,
        x: {
          from: box.x - 5,
          to: box.x + 5
        },
        y: {
          from: box.y - 5,
          to: box.y + 5
        },
        duration: 50, // 抖动速度很快
        yoyo: true,
        repeat: -1, // 无限重复
        ease: 'Sine.easeInOut',
        onRepeat: () => {
          this.shakeCount++;
        }
      });

      this.tweens.push(shakeTween);
    }

    // 2秒后停止所有动画
    this.time.delayedCall(2000, () => {
      this.stopAllShakes();
    });

    // 更新状态显示
    this.updateStatus();
  }

  update(time, delta) {
    if (this.animationStatus === 'running') {
      this.elapsedTime += delta;
      this.updateStatus();
    }
  }

  stopAllShakes() {
    // 停止所有 Tween 动画
    this.tweens.forEach(tween => {
      tween.stop();
    });

    // 将所有方块恢复到初始位置
    this.boxes.forEach(box => {
      box.setPosition(box.initialX, box.initialY);
    });

    // 更新状态
    this.animationStatus = 'stopped';
    this.updateStatus();

    // 显示完成消息
    this.add.text(this.cameras.main.width / 2, this.cameras.main.height - 100, 
      '抖动动画已停止！', {
      fontSize: '20px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);
  }

  updateStatus() {
    const timeRemaining = Math.max(0, 2000 - this.elapsedTime);
    this.statusText.setText(
      `状态: ${this.animationStatus}\n` +
      `运行时间: ${(this.elapsedTime / 1000).toFixed(2)}s\n` +
      `剩余时间: ${(timeRemaining / 1000).toFixed(2)}s\n` +
      `抖动次数: ${this.shakeCount}`
    );
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: ShakeScene
};

new Phaser.Game(config);