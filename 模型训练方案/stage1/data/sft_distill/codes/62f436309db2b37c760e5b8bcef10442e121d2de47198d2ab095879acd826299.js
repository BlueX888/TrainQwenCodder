class FadeScene extends Phaser.Scene {
  constructor() {
    super('FadeScene');
    // 状态信号变量
    this.fadeStatus = 'initial'; // initial -> fadingIn -> visible -> fadingOut -> complete
    this.fadeInComplete = false;
    this.fadeOutComplete = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建背景
    const graphics = this.add.graphics();
    graphics.fillStyle(0x2d4263, 1);
    graphics.fillRect(0, 0, 800, 600);

    // 创建中心文字背景
    const textBg = this.add.graphics();
    textBg.fillStyle(0x4a90e2, 1);
    textBg.fillRoundedRect(250, 250, 300, 100, 10);

    // 创建文字提示
    const statusText = this.add.text(400, 300, 'Scene Fade Demo', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff',
      align: 'center'
    });
    statusText.setOrigin(0.5);

    // 创建状态指示器
    this.statusIndicator = this.add.text(400, 400, 'Status: Fading In...', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffff00',
      align: 'center'
    });
    this.statusIndicator.setOrigin(0.5);

    // 添加装饰圆圈
    const circle1 = this.add.graphics();
    circle1.fillStyle(0xe74c3c, 1);
    circle1.fillCircle(150, 150, 40);

    const circle2 = this.add.graphics();
    circle2.fillStyle(0x2ecc71, 1);
    circle2.fillCircle(650, 150, 40);

    const circle3 = this.add.graphics();
    circle3.fillStyle(0xf39c12, 1);
    circle3.fillCircle(150, 450, 40);

    const circle4 = this.add.graphics();
    circle4.fillStyle(0x9b59b6, 1);
    circle4.fillCircle(650, 450, 40);

    // 获取主摄像机
    const camera = this.cameras.main;

    // 设置初始状态
    this.fadeStatus = 'fadingIn';

    // 执行淡入效果（从黑色淡入，持续2500毫秒）
    camera.fadeIn(2500, 0, 0, 0);

    // 监听淡入完成事件
    camera.once('camerafadeincomplete', () => {
      console.log('Fade in complete!');
      this.fadeStatus = 'visible';
      this.fadeInComplete = true;
      this.statusIndicator.setText('Status: Visible');
      this.statusIndicator.setColor('#00ff00');

      // 淡入完成后等待1秒，然后执行淡出
      this.time.delayedCall(1000, () => {
        this.fadeStatus = 'fadingOut';
        this.statusIndicator.setText('Status: Fading Out...');
        this.statusIndicator.setColor('#ff9900');

        // 执行淡出效果（淡出到黑色，持续2500毫秒）
        camera.fadeOut(2500, 0, 0, 0);

        // 监听淡出完成事件
        camera.once('camerafadeoutcomplete', () => {
          console.log('Fade out complete!');
          this.fadeStatus = 'complete';
          this.fadeOutComplete = true;
          this.statusIndicator.setText('Status: Complete');
          this.statusIndicator.setColor('#ff0000');

          // 淡出完成后可以重新开始或切换场景
          this.time.delayedCall(1000, () => {
            console.log('Restarting fade cycle...');
            this.scene.restart();
          });
        });
      });
    });

    // 添加调试信息
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    // 更新调试信息
    this.debugText.setText([
      `Fade Status: ${this.fadeStatus}`,
      `Fade In Complete: ${this.fadeInComplete}`,
      `Fade Out Complete: ${this.fadeOutComplete}`,
      `Time: ${Math.floor(time / 1000)}s`
    ]);
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: FadeScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);