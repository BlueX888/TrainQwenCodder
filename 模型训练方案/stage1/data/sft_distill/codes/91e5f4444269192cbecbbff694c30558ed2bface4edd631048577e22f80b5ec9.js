class ProgressBarScene extends Phaser.Scene {
  constructor() {
    super('ProgressBarScene');
    this.progress = 0; // 可验证的状态信号
    this.maxProgress = 12;
    this.isCompleted = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const centerX = 400;
    const centerY = 300;
    const barWidth = 480;
    const barHeight = 40;

    // 创建进度条背景（灰色）
    this.progressBarBg = this.add.rectangle(
      centerX,
      centerY,
      barWidth,
      barHeight,
      0x333333
    );
    this.progressBarBg.setOrigin(0.5, 0.5);

    // 创建进度条边框
    const graphics = this.add.graphics();
    graphics.lineStyle(3, 0x666666, 1);
    graphics.strokeRect(
      centerX - barWidth / 2,
      centerY - barHeight / 2,
      barWidth,
      barHeight
    );

    // 创建进度条前景（橙色）- 初始宽度为0
    this.progressBarFill = this.add.rectangle(
      centerX - barWidth / 2,
      centerY,
      0, // 初始宽度为0
      barHeight - 6,
      0xff6600
    );
    this.progressBarFill.setOrigin(0, 0.5);

    // 创建进度文本
    this.progressText = this.add.text(
      centerX,
      centerY,
      '0 / 12',
      {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    );
    this.progressText.setOrigin(0.5, 0.5);

    // 创建标题文本
    this.titleText = this.add.text(
      centerX,
      centerY - 80,
      'Progress Bar Demo',
      {
        fontSize: '32px',
        fontFamily: 'Arial',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    );
    this.titleText.setOrigin(0.5, 0.5);

    // 创建完成文本（初始隐藏）
    this.completeText = this.add.text(
      centerX,
      centerY + 80,
      'COMPLETED!',
      {
        fontSize: '36px',
        fontFamily: 'Arial',
        color: '#00ff00',
        fontStyle: 'bold'
      }
    );
    this.completeText.setOrigin(0.5, 0.5);
    this.completeText.setVisible(false);

    // 存储进度条最大宽度
    this.maxBarWidth = barWidth - 6;

    // 创建定时器，每秒增加进度
    this.timerEvent = this.time.addEvent({
      delay: 1000, // 1秒
      callback: this.increaseProgress,
      callbackScope: this,
      loop: true
    });

    // 添加调试信息
    this.debugText = this.add.text(
      10,
      10,
      'Progress: 0/12',
      {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#ffff00'
      }
    );
  }

  increaseProgress() {
    if (this.progress < this.maxProgress) {
      this.progress++;
      
      // 更新进度条宽度
      const fillWidth = (this.progress / this.maxProgress) * this.maxBarWidth;
      this.progressBarFill.width = fillWidth;

      // 更新进度文本
      this.progressText.setText(`${this.progress} / ${this.maxProgress}`);

      // 更新调试文本
      this.debugText.setText(`Progress: ${this.progress}/${this.maxProgress}`);

      // 检查是否完成
      if (this.progress >= this.maxProgress) {
        this.onComplete();
      }
    }
  }

  onComplete() {
    // 停止定时器
    if (this.timerEvent) {
      this.timerEvent.remove();
      this.timerEvent = null;
    }

    // 标记为完成
    this.isCompleted = true;

    // 显示完成文本
    this.completeText.setVisible(true);

    // 添加完成动画效果
    this.tweens.add({
      targets: this.completeText,
      scaleX: 1.2,
      scaleY: 1.2,
      yoyo: true,
      duration: 300,
      repeat: 2
    });

    // 进度条闪烁效果
    this.tweens.add({
      targets: this.progressBarFill,
      alpha: 0.5,
      yoyo: true,
      duration: 200,
      repeat: 5
    });

    // 更新调试信息
    this.debugText.setText(`Progress: ${this.progress}/${this.maxProgress} - COMPLETED!`);
    this.debugText.setColor('#00ff00');
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
    // 当前实现主要依赖 TimerEvent，update 中无需额外处理
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: ProgressBarScene
};

// 创建游戏实例
new Phaser.Game(config);