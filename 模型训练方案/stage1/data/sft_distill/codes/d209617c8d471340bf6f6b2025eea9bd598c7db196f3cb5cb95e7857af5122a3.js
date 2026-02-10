class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
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
    bg.fillStyle(0x2c3e50, 1);
    bg.fillRect(0, 0, width, height);

    // 创建中心显示文本
    const centerText = this.add.text(width / 2, height / 2, 'BOUNCE EFFECT', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    centerText.setOrigin(0.5);

    // 创建状态显示文本
    this.statusText = this.add.text(20, 20, 'Bounce: Starting...', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#3498db'
    });

    // 创建一些装饰性的图形元素
    const graphics = this.add.graphics();
    graphics.fillStyle(0xe74c3c, 1);
    graphics.fillCircle(100, 100, 40);
    graphics.fillStyle(0x3498db, 1);
    graphics.fillCircle(width - 100, 100, 40);
    graphics.fillStyle(0x2ecc71, 1);
    graphics.fillCircle(100, height - 100, 40);
    graphics.fillStyle(0xf39c12, 1);
    graphics.fillCircle(width - 100, height - 100, 40);

    // 创建一个容器来包含所有需要弹跳的元素
    this.bounceContainer = this.add.container(0, 0);
    this.bounceContainer.add([bg, centerText, this.statusText, graphics]);

    // 实现弹跳效果 - 使用垂直方向的Tween动画
    // 模拟弹跳：向下移动再弹回，重复多次，逐渐减弱
    this.tweens.add({
      targets: this.bounceContainer,
      y: [
        { value: 30, duration: 150, ease: 'Quad.easeOut' },
        { value: 0, duration: 150, ease: 'Bounce.easeOut' },
        { value: 20, duration: 120, ease: 'Quad.easeOut' },
        { value: 0, duration: 120, ease: 'Bounce.easeOut' },
        { value: 10, duration: 100, ease: 'Quad.easeOut' },
        { value: 0, duration: 100, ease: 'Bounce.easeOut' },
        { value: 5, duration: 80, ease: 'Quad.easeOut' },
        { value: 0, duration: 80, ease: 'Bounce.easeOut' }
      ],
      duration: 2500,
      onUpdate: (tween) => {
        // 更新弹跳进度
        this.bounceProgress = Math.floor(tween.progress * 100);
        this.statusText.setText(`Bounce: ${this.bounceProgress}%`);
      },
      onComplete: () => {
        this.bounceComplete = true;
        this.bounceProgress = 100;
        this.statusText.setText('Bounce: Complete!');
        this.statusText.setColor('#2ecc71');
        
        // 完成后添加一个闪烁效果
        this.tweens.add({
          targets: centerText,
          alpha: 0.3,
          duration: 500,
          yoyo: true,
          repeat: 2
        });
      }
    });

    // 同时添加轻微的水平摇晃效果增强弹跳感
    this.tweens.add({
      targets: this.bounceContainer,
      x: [
        { value: -5, duration: 150 },
        { value: 5, duration: 300 },
        { value: -3, duration: 200 },
        { value: 3, duration: 200 },
        { value: 0, duration: 150 }
      ],
      duration: 2500,
      ease: 'Sine.easeInOut'
    });

    // 添加相机轻微震动效果（可选，增强弹跳感）
    this.cameras.main.shake(2500, 0.002, false);

    // 添加说明文字
    const instructionText = this.add.text(width / 2, height - 50, 
      'Scene will bounce for 2.5 seconds', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#95a5a6'
    });
    instructionText.setOrigin(0.5);
    this.bounceContainer.add(instructionText);
  }

  update(time, delta) {
    // 可以在这里添加额外的逻辑
    // 当前弹跳效果由Tween系统自动处理
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#34495e',
  scene: GameScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态验证函数（用于测试）
window.getBounceStatus = function() {
  const scene = game.scene.scenes[0];
  return {
    bounceComplete: scene.bounceComplete,
    bounceProgress: scene.bounceProgress
  };
};