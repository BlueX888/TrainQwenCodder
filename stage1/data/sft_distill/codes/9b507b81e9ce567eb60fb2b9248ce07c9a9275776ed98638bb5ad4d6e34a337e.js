class BounceScene extends Phaser.Scene {
  constructor() {
    super('BounceScene');
    // 状态信号变量
    this.bounceCompleted = false;
    this.bounceProgress = 0;
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

    // 创建中心标题文字
    const titleText = this.add.text(width / 2, height / 2 - 100, 'BOUNCE SCENE', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    titleText.setOrigin(0.5);

    // 创建装饰性图形元素
    const graphics = this.add.graphics();
    
    // 绘制多个圆形作为参照物
    const colors = [0xff6b6b, 0x4ecdc4, 0xffe66d, 0x95e1d3];
    for (let i = 0; i < 4; i++) {
      const x = width / 4 * (i + 0.5);
      const y = height / 2 + 80;
      graphics.fillStyle(colors[i], 1);
      graphics.fillCircle(x, y, 40);
    }

    // 创建状态显示文本
    this.statusText = this.add.text(width / 2, height - 50, 'Bounce Progress: 0%', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff'
    });
    this.statusText.setOrigin(0.5);

    // 创建容器包含所有元素，便于整体动画
    this.sceneContainer = this.add.container(0, 0);
    this.sceneContainer.add([bg, titleText, graphics, this.statusText]);

    // 实现弹跳效果 - 方案1: 使用相机震动
    this.cameras.main.shake(500, 0.005, false);

    // 实现弹跳效果 - 方案2: 使用缩放动画创建弹跳感
    this.sceneContainer.setScale(0.8);
    
    this.tweens.add({
      targets: this.sceneContainer,
      scaleX: 1,
      scaleY: 1,
      duration: 500,
      ease: 'Bounce.easeOut',
      onUpdate: (tween) => {
        // 更新进度状态
        this.bounceProgress = Math.floor(tween.progress * 100);
        this.statusText.setText(`Bounce Progress: ${this.bounceProgress}%`);
      },
      onComplete: () => {
        this.bounceCompleted = true;
        this.statusText.setText('Bounce Completed! ✓');
        this.statusText.setColor('#4ecdc4');
        
        // 弹跳完成后的提示动画
        this.tweens.add({
          targets: this.statusText,
          alpha: 0.5,
          duration: 500,
          yoyo: true,
          repeat: -1
        });
      }
    });

    // 添加额外的Y轴弹跳效果
    this.sceneContainer.y = -50;
    this.tweens.add({
      targets: this.sceneContainer,
      y: 0,
      duration: 500,
      ease: 'Bounce.easeOut'
    });

    // 添加调试信息
    const debugText = this.add.text(10, 10, 'Press SPACE to restart bounce', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#888888'
    });

    // 添加键盘交互 - 按空格键重新触发弹跳
    this.input.keyboard.on('keydown-SPACE', () => {
      this.restartBounce();
    });
  }

  restartBounce() {
    // 重置状态
    this.bounceCompleted = false;
    this.bounceProgress = 0;
    this.statusText.setColor('#ffffff');
    this.statusText.setAlpha(1);

    // 停止所有现有动画
    this.tweens.killTweensOf(this.sceneContainer);
    this.tweens.killTweensOf(this.statusText);

    // 重新开始弹跳动画
    this.sceneContainer.setScale(0.8);
    this.sceneContainer.y = -50;

    this.cameras.main.shake(500, 0.005, false);

    this.tweens.add({
      targets: this.sceneContainer,
      scaleX: 1,
      scaleY: 1,
      duration: 500,
      ease: 'Bounce.easeOut',
      onUpdate: (tween) => {
        this.bounceProgress = Math.floor(tween.progress * 100);
        this.statusText.setText(`Bounce Progress: ${this.bounceProgress}%`);
      },
      onComplete: () => {
        this.bounceCompleted = true;
        this.statusText.setText('Bounce Completed! ✓');
        this.statusText.setColor('#4ecdc4');
        
        this.tweens.add({
          targets: this.statusText,
          alpha: 0.5,
          duration: 500,
          yoyo: true,
          repeat: -1
        });
      }
    });

    this.tweens.add({
      targets: this.sceneContainer,
      y: 0,
      duration: 500,
      ease: 'Bounce.easeOut'
    });
  }

  update(time, delta) {
    // 可以在这里添加持续的更新逻辑
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