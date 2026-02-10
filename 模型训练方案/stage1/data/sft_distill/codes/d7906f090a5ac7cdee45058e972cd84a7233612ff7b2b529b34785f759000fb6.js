class FlashScene extends Phaser.Scene {
  constructor() {
    super('FlashScene');
    this.flashCount = 0;  // 闪烁次数计数器（可验证状态）
    this.isFlashing = true;  // 闪烁状态标志
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x2c3e50, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建中心文字提示
    const text = this.add.text(400, 250, 'Scene Flashing Effect', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    text.setOrigin(0.5);

    // 创建状态显示文字
    this.statusText = this.add.text(400, 320, 'Flash Count: 0\nStatus: Flashing', {
      fontSize: '20px',
      color: '#ecf0f1',
      align: 'center'
    });
    this.statusText.setOrigin(0.5);

    // 创建一些装饰性图形
    const circle1 = this.add.graphics();
    circle1.fillStyle(0xe74c3c, 1);
    circle1.fillCircle(150, 450, 40);

    const circle2 = this.add.graphics();
    circle2.fillStyle(0x3498db, 1);
    circle2.fillCircle(650, 450, 40);

    const rect = this.add.graphics();
    rect.fillStyle(0x2ecc71, 1);
    rect.fillRect(350, 100, 100, 80);

    // 获取主摄像机
    const camera = this.cameras.main;

    // 闪烁参数配置
    const flashDuration = 300;  // 每次闪烁持续时间（毫秒）
    const flashInterval = 500;  // 闪烁间隔（毫秒）
    const totalDuration = 3000;  // 总持续时间（3秒）

    // 立即执行第一次闪烁
    camera.flash(flashDuration, 255, 255, 255);
    this.flashCount++;
    this.updateStatus();

    // 创建定时器，重复执行闪烁
    this.flashTimer = this.time.addEvent({
      delay: flashInterval,
      callback: () => {
        if (this.isFlashing) {
          camera.flash(flashDuration, 255, 255, 255);
          this.flashCount++;
          this.updateStatus();
        }
      },
      loop: true
    });

    // 3秒后停止闪烁
    this.time.delayedCall(totalDuration, () => {
      this.isFlashing = false;
      this.flashTimer.remove();
      this.updateStatus();
      
      // 显示完成提示
      const completeText = this.add.text(400, 400, 'Flashing Complete!', {
        fontSize: '24px',
        color: '#2ecc71',
        fontStyle: 'bold'
      });
      completeText.setOrigin(0.5);
      
      // 添加淡入效果
      completeText.setAlpha(0);
      this.tweens.add({
        targets: completeText,
        alpha: 1,
        duration: 500,
        ease: 'Power2'
      });
    });

    // 添加说明文字
    const instruction = this.add.text(400, 550, 'Watch the white flash effect for 3 seconds', {
      fontSize: '16px',
      color: '#95a5a6',
      fontStyle: 'italic'
    });
    instruction.setOrigin(0.5);
  }

  updateStatus() {
    // 更新状态显示
    const status = this.isFlashing ? 'Flashing' : 'Completed';
    this.statusText.setText(
      `Flash Count: ${this.flashCount}\nStatus: ${status}`
    );
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
  scene: FlashScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);