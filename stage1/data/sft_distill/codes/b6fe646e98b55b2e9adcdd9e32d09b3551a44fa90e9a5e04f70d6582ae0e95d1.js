class FadeScene extends Phaser.Scene {
  constructor() {
    super('FadeScene');
    // 状态信号变量
    this.fadeInComplete = false;
    this.fadeOutComplete = false;
    this.totalFadeTime = 0;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建背景
    const background = this.add.graphics();
    background.fillStyle(0x2d2d2d, 1);
    background.fillRect(0, 0, width, height);

    // 创建中心装饰图形
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0x00ff88, 1);
    centerGraphics.fillCircle(width / 2, height / 2, 100);
    
    // 添加内圈
    centerGraphics.fillStyle(0xff6b6b, 1);
    centerGraphics.fillCircle(width / 2, height / 2, 60);
    
    // 添加文字提示
    this.statusText = this.add.text(width / 2, height / 2 - 200, 'Fade Demo', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.infoText = this.add.text(width / 2, height / 2 + 150, 'Fading In...', {
      fontSize: '24px',
      color: '#ffff00'
    }).setOrigin(0.5);

    // 获取主相机
    const camera = this.cameras.main;

    // 场景开始时淡入，持续1500ms（1.5秒）
    camera.fadeIn(1500, 0, 0, 0);

    // 监听淡入完成事件
    camera.once('camerafadeincomplete', () => {
      this.fadeInComplete = true;
      this.totalFadeTime = 1.5;
      this.infoText.setText('Fade In Complete! Fading Out...');
      
      console.log('Fade In Complete at', this.totalFadeTime, 'seconds');

      // 淡入完成后，开始淡出，持续1500ms（1.5秒）
      camera.fadeOut(1500, 0, 0, 0);
    });

    // 监听淡出完成事件
    camera.once('camerafadeoutcomplete', () => {
      this.fadeOutComplete = true;
      this.totalFadeTime = 3.0;
      
      console.log('Fade Out Complete at', this.totalFadeTime, 'seconds');
      console.log('All fade effects completed!');
      
      // 淡出完成后可以重新淡入，形成循环
      setTimeout(() => {
        this.infoText.setText('Restarting Fade Cycle...');
        this.restartFade();
      }, 500);
    });

    // 添加调试信息显示
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateDebugInfo();
  }

  update(time, delta) {
    // 更新调试信息
    this.updateDebugInfo();
  }

  updateDebugInfo() {
    const debugInfo = [
      `Fade In Complete: ${this.fadeInComplete}`,
      `Fade Out Complete: ${this.fadeOutComplete}`,
      `Total Fade Time: ${this.totalFadeTime}s`,
      `Camera Alpha: ${this.cameras.main.alpha.toFixed(2)}`
    ];
    this.debugText.setText(debugInfo.join('\n'));
  }

  restartFade() {
    // 重置状态
    this.fadeInComplete = false;
    this.fadeOutComplete = false;
    this.totalFadeTime = 0;
    
    const camera = this.cameras.main;
    
    // 重新开始淡入
    this.infoText.setText('Fading In...');
    camera.fadeIn(1500, 0, 0, 0);

    // 重新绑定事件
    camera.once('camerafadeincomplete', () => {
      this.fadeInComplete = true;
      this.totalFadeTime = 1.5;
      this.infoText.setText('Fade In Complete! Fading Out...');
      camera.fadeOut(1500, 0, 0, 0);
    });

    camera.once('camerafadeoutcomplete', () => {
      this.fadeOutComplete = true;
      this.totalFadeTime = 3.0;
      setTimeout(() => {
        this.infoText.setText('Restarting Fade Cycle...');
        this.restartFade();
      }, 500);
    });
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