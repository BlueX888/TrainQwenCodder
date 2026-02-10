class BounceScene extends Phaser.Scene {
  constructor() {
    super('BounceScene');
    this.bounceComplete = false; // 状态信号：弹跳是否完成
    this.bounceProgress = 0; // 状态信号：弹跳进度 0-100
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x2d2d2d, 1);
    bg.fillRect(0, 0, width, height);

    // 创建标题文字
    const titleText = this.add.text(width / 2, height / 2 - 100, 'BOUNCE EFFECT', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 创建多个装饰圆形
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff6b6b, 1);
    graphics.fillCircle(width / 2, height / 2, 80);
    
    graphics.fillStyle(0x4ecdc4, 0.7);
    graphics.fillCircle(width / 2 - 150, height / 2 + 100, 50);
    
    graphics.fillStyle(0xffe66d, 0.7);
    graphics.fillCircle(width / 2 + 150, height / 2 + 100, 50);

    // 创建状态显示文字
    this.statusText = this.add.text(width / 2, height - 50, 'Bouncing: 0%', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 实现弹跳效果 - 使用相机缩放和位置变化
    const camera = this.cameras.main;
    
    // 方案1: 使用相机震动效果（轻微抖动）
    camera.shake(2500, 0.002);

    // 方案2: 使用Tween实现弹跳缩放效果
    this.tweens.add({
      targets: camera,
      zoom: { from: 0.8, to: 1 },
      duration: 2500,
      ease: 'Bounce.easeOut',
      onUpdate: (tween) => {
        // 更新弹跳进度
        this.bounceProgress = Math.floor(tween.progress * 100);
        this.statusText.setText(`Bouncing: ${this.bounceProgress}%`);
      },
      onComplete: () => {
        this.bounceComplete = true;
        this.bounceProgress = 100;
        this.statusText.setText('Bounce Complete!');
        this.statusText.setColor('#4ecdc4');
        
        // 弹跳完成后的提示动画
        this.tweens.add({
          targets: this.statusText,
          scale: { from: 1, to: 1.2 },
          duration: 300,
          yoyo: true,
          repeat: 2
        });
      }
    });

    // 额外添加Y轴位置弹跳，增强效果
    this.tweens.add({
      targets: camera,
      scrollY: { from: -50, to: 0 },
      duration: 2500,
      ease: 'Bounce.easeOut'
    });

    // 添加装饰元素的旋转动画
    this.tweens.add({
      targets: graphics,
      angle: 360,
      duration: 2500,
      ease: 'Linear'
    });

    // 添加标题的缩放弹跳
    this.tweens.add({
      targets: titleText,
      scale: { from: 0.5, to: 1 },
      duration: 2500,
      ease: 'Bounce.easeOut'
    });

    // 添加调试信息
    const debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 更新调试信息
    this.time.addEvent({
      delay: 100,
      callback: () => {
        debugText.setText([
          `Bounce Complete: ${this.bounceComplete}`,
          `Progress: ${this.bounceProgress}%`,
          `Camera Zoom: ${camera.zoom.toFixed(2)}`,
          `Camera Y: ${camera.scrollY.toFixed(2)}`
        ]);
      },
      loop: true
    });
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
  scene: BounceScene,
  parent: 'game-container'
};

// 创建游戏实例
new Phaser.Game(config);