class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 可验证的状态信号
    this.fadeInComplete = false;
    this.fadeStartTime = 0;
    this.fadeEndTime = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建背景（使用 Graphics 程序化生成）
    const bgGraphics = this.add.graphics();
    bgGraphics.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
    bgGraphics.fillRect(0, 0, width, height);

    // 创建一些装饰性的圆形元素
    const decorGraphics = this.add.graphics();
    decorGraphics.fillStyle(0x0f3460, 0.6);
    decorGraphics.fillCircle(150, 150, 80);
    decorGraphics.fillStyle(0xe94560, 0.4);
    decorGraphics.fillCircle(650, 450, 100);
    decorGraphics.fillStyle(0x533483, 0.5);
    decorGraphics.fillCircle(400, 300, 60);

    // 程序化生成玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.fillStyle(0xffffff, 1);
    playerGraphics.fillCircle(12, 15, 4);
    playerGraphics.fillCircle(28, 15, 4);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建玩家精灵
    this.player = this.add.sprite(width / 2, height / 2, 'player');
    this.player.setScale(2);

    // 添加标题文本
    this.titleText = this.add.text(width / 2, 100, 'Fade In Demo', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // 添加状态文本
    this.statusText = this.add.text(width / 2, height - 100, 'Fading in...', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#e94560'
    }).setOrigin(0.5);

    // 添加状态信息文本（用于验证）
    this.infoText = this.add.text(20, 20, '', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 记录淡入开始时间
    this.fadeStartTime = this.time.now;

    // 执行淡入效果（从黑色淡入，持续1500毫秒）
    this.cameras.main.fadeIn(1500, 0, 0, 0);

    // 监听淡入完成事件
    this.cameras.main.once('camerafadeincomplete', (camera) => {
      this.fadeInComplete = true;
      this.fadeEndTime = this.time.now;
      this.statusText.setText('Fade in complete!');
      this.statusText.setColor('#00ff00');
      
      // 淡入完成后，添加一个简单的动画效果
      this.tweens.add({
        targets: this.player,
        angle: 360,
        duration: 2000,
        ease: 'Power2',
        repeat: -1
      });

      // 2秒后演示淡出效果
      this.time.delayedCall(2000, () => {
        this.statusText.setText('Fading out...');
        this.statusText.setColor('#ff9900');
        
        // 淡出到黑色，持续1500毫秒
        this.cameras.main.fadeOut(1500, 0, 0, 0);
        
        // 监听淡出完成
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.statusText.setText('Fade out complete!');
          
          // 淡出完成后再次淡入
          this.time.delayedCall(500, () => {
            this.cameras.main.fadeIn(1500, 0, 0, 0);
            this.statusText.setText('Fading in again...');
            this.statusText.setColor('#e94560');
          });
        });
      });
    });
  }

  update(time, delta) {
    // 更新状态信息（用于验证）
    const fadeProgress = this.cameras.main.fadeEffect.progress;
    const fadeDuration = time - this.fadeStartTime;
    
    this.infoText.setText([
      `Fade Complete: ${this.fadeInComplete}`,
      `Fade Progress: ${fadeProgress.toFixed(2)}`,
      `Fade Duration: ${fadeDuration.toFixed(0)}ms`,
      `Expected: 1500ms`,
      `Camera Alpha: ${this.cameras.main.alpha.toFixed(2)}`
    ]);

    // 简单的背景动画
    if (this.player) {
      this.player.y = this.cameras.main.height / 2 + Math.sin(time / 500) * 20;
    }
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: GameScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);