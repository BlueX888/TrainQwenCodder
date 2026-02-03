class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 状态信号变量
    this.fadeInComplete = false;
    this.fadeOutComplete = false;
    this.effectStatus = 'starting';
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建背景 - 使用 Graphics 绘制渐变背景
    const graphics = this.add.graphics();
    
    // 绘制天空渐变
    for (let i = 0; i < height; i++) {
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(
        { r: 135, g: 206, b: 235 },
        { r: 255, g: 182, b: 193 },
        height,
        i
      );
      graphics.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b), 1);
      graphics.fillRect(0, i, width, 1);
    }

    // 绘制太阳
    const sunGraphics = this.add.graphics();
    sunGraphics.fillStyle(0xFFD700, 1);
    sunGraphics.fillCircle(0, 0, 40);
    sunGraphics.generateTexture('sun', 80, 80);
    sunGraphics.destroy();

    const sun = this.add.image(width - 100, 100, 'sun');
    sun.setScale(1.2);

    // 绘制地面
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x228B22, 1);
    groundGraphics.fillRect(0, 0, width, 100);
    groundGraphics.generateTexture('ground', width, 100);
    groundGraphics.destroy();

    this.add.image(width / 2, height - 50, 'ground');

    // 创建一些装饰性的树
    for (let i = 0; i < 5; i++) {
      const treeGraphics = this.add.graphics();
      
      // 树干
      treeGraphics.fillStyle(0x8B4513, 1);
      treeGraphics.fillRect(15, 30, 10, 30);
      
      // 树冠
      treeGraphics.fillStyle(0x228B22, 1);
      treeGraphics.fillCircle(20, 25, 20);
      treeGraphics.fillCircle(10, 30, 15);
      treeGraphics.fillCircle(30, 30, 15);
      
      treeGraphics.generateTexture('tree', 40, 60);
      treeGraphics.destroy();
      
      const tree = this.add.image(
        100 + i * 150,
        height - 130,
        'tree'
      );
      tree.setScale(1.5);
    }

    // 创建状态显示文本
    this.statusText = this.add.text(20, 20, '', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();

    // 场景淡入效果 - 从黑色淡入，持续1500毫秒
    this.effectStatus = 'fading in';
    this.updateStatusText();

    this.cameras.main.fadeIn(1500, 0, 0, 0);

    // 监听淡入完成事件
    this.cameras.main.once('camerafadeincomplete', () => {
      this.fadeInComplete = true;
      this.effectStatus = 'fade in complete';
      this.updateStatusText();

      // 等待1秒后开始淡出
      this.time.delayedCall(1000, () => {
        this.effectStatus = 'fading out';
        this.updateStatusText();

        // 场景淡出效果 - 淡出到黑色，持续1500毫秒
        this.cameras.main.fadeOut(1500, 0, 0, 0);
      });
    });

    // 监听淡出完成事件
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.fadeOutComplete = true;
      this.effectStatus = 'fade out complete';
      this.updateStatusText();

      // 淡出完成后可以重新开始或切换场景
      this.time.delayedCall(1000, () => {
        this.effectStatus = 'restarting...';
        this.updateStatusText();
        
        // 重新开始场景以循环演示
        this.time.delayedCall(500, () => {
          this.scene.restart();
        });
      });
    });

    // 添加说明文本
    this.add.text(width / 2, height / 2, 'Scene Fade In/Out Demo', {
      fontSize: '48px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 6,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 5,
        fill: true
      }
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 60, 'Watch the fade effects!', {
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
  }

  updateStatusText() {
    this.statusText.setText([
      `Status: ${this.effectStatus}`,
      `Fade In: ${this.fadeInComplete ? '✓' : '✗'}`,
      `Fade Out: ${this.fadeOutComplete ? '✓' : '✗'}`
    ]);
  }

  update(time, delta) {
    // 可以在这里添加额外的动画或逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: GameScene,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

// 创建游戏实例
new Phaser.Game(config);