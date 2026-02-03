class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bounceCompleted = false; // 状态信号：弹跳是否完成
    this.bounceProgress = 0; // 状态信号：弹跳进度 (0-100)
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // 创建背景
    const background = this.add.graphics();
    background.fillStyle(0x2c3e50, 1);
    background.fillRect(0, 0, width, height);
    
    // 创建中心装饰元素
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0x3498db, 1);
    centerGraphics.fillCircle(width / 2, height / 2, 80);
    
    centerGraphics.lineStyle(4, 0xecf0f1, 1);
    centerGraphics.strokeCircle(width / 2, height / 2, 80);
    
    // 创建四个角的装饰方块
    this.createCornerBlocks();
    
    // 创建状态文本
    this.statusText = this.add.text(width / 2, 50, 'Bouncing...', {
      fontSize: '32px',
      fill: '#ecf0f1',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    this.progressText = this.add.text(width / 2, 100, 'Progress: 0%', {
      fontSize: '24px',
      fill: '#95a5a6'
    }).setOrigin(0.5);
    
    // 实现弹跳效果
    this.implementBounceEffect();
  }

  createCornerBlocks() {
    const { width, height } = this.cameras.main;
    const blockSize = 60;
    const offset = 40;
    
    const positions = [
      { x: offset, y: offset }, // 左上
      { x: width - offset, y: offset }, // 右上
      { x: offset, y: height - offset }, // 左下
      { x: width - offset, y: height - offset } // 右下
    ];
    
    const colors = [0xe74c3c, 0xf39c12, 0x2ecc71, 0x9b59b6];
    
    positions.forEach((pos, index) => {
      const graphics = this.add.graphics();
      graphics.fillStyle(colors[index], 1);
      graphics.fillRect(
        pos.x - blockSize / 2,
        pos.y - blockSize / 2,
        blockSize,
        blockSize
      );
      
      graphics.lineStyle(3, 0xecf0f1, 1);
      graphics.strokeRect(
        pos.x - blockSize / 2,
        pos.y - blockSize / 2,
        blockSize,
        blockSize
      );
    });
  }

  implementBounceEffect() {
    const camera = this.cameras.main;
    const duration = 500; // 0.5秒
    
    // 创建弹跳缩放动画
    this.tweens.add({
      targets: camera,
      zoom: 1.15, // 放大到1.15倍
      duration: duration / 4,
      ease: 'Cubic.easeOut',
      yoyo: true,
      repeat: 1, // 重复一次形成弹跳效果
      onUpdate: (tween) => {
        // 更新进度
        this.bounceProgress = Math.floor(tween.progress * 100);
        this.progressText.setText(`Progress: ${this.bounceProgress}%`);
      },
      onComplete: () => {
        this.bounceCompleted = true;
        this.onBounceComplete();
      }
    });
    
    // 添加轻微的相机抖动增强弹跳感
    camera.shake(duration, 0.003);
    
    // 添加Y轴位移动画模拟弹跳
    const originalY = camera.scrollY;
    this.tweens.add({
      targets: camera,
      scrollY: originalY - 20,
      duration: duration / 4,
      ease: 'Cubic.easeOut',
      yoyo: true,
      repeat: 1
    });
  }

  onBounceComplete() {
    // 弹跳完成后的处理
    this.statusText.setText('Bounce Complete!');
    this.statusText.setStyle({ fill: '#2ecc71' });
    
    this.progressText.setText('Progress: 100%');
    this.progressText.setStyle({ fill: '#2ecc71' });
    
    // 添加完成提示动画
    this.tweens.add({
      targets: this.statusText,
      scale: 1.2,
      duration: 200,
      yoyo: true,
      ease: 'Sine.easeInOut'
    });
    
    console.log('Bounce effect completed!');
    console.log('Bounce status:', this.bounceCompleted);
    console.log('Final progress:', this.bounceProgress);
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
  backgroundColor: '#1a1a1a',
  scene: GameScene,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  }
};

// 创建游戏实例
const game = new Phaser.Game(config);