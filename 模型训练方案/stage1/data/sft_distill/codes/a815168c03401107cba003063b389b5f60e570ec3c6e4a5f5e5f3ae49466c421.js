class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 状态信号：用于验证旋转效果
    this.rotationComplete = false;
    this.rotationProgress = 0; // 0-100 的进度值
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建背景网格，方便观察旋转效果
    const graphics = this.add.graphics();
    
    // 绘制背景
    graphics.fillStyle(0x1a1a2e, 1);
    graphics.fillRect(0, 0, width, height);

    // 绘制网格线
    graphics.lineStyle(2, 0x16213e, 0.5);
    const gridSize = 50;
    for (let x = 0; x <= width; x += gridSize) {
      graphics.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y <= height; y += gridSize) {
      graphics.lineBetween(0, y, width, y);
    }

    // 创建中心参考点
    const centerGraphics = this.add.graphics();
    centerGraphics.fillStyle(0xff6b6b, 1);
    centerGraphics.fillCircle(width / 2, height / 2, 20);
    centerGraphics.lineStyle(4, 0xffffff, 1);
    centerGraphics.lineBetween(width / 2, height / 2, width / 2, height / 2 - 60);

    // 创建四个角的标记，方便观察旋转
    const corners = [
      { x: 100, y: 100, color: 0xff0000 },  // 红色 - 左上
      { x: width - 100, y: 100, color: 0x00ff00 },  // 绿色 - 右上
      { x: width - 100, y: height - 100, color: 0x0000ff },  // 蓝色 - 右下
      { x: 100, y: height - 100, color: 0xffff00 }  // 黄色 - 左下
    ];

    corners.forEach(corner => {
      const cornerGraphics = this.add.graphics();
      cornerGraphics.fillStyle(corner.color, 1);
      cornerGraphics.fillRect(corner.x - 25, corner.y - 25, 50, 50);
    });

    // 添加文字提示
    const text = this.add.text(width / 2, 50, 'Scene Rotation Effect', {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    });
    text.setOrigin(0.5);

    // 状态文本
    this.statusText = this.add.text(width / 2, height - 50, 'Rotating: 0%', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#4ecdc4',
      stroke: '#000000',
      strokeThickness: 3
    });
    this.statusText.setOrigin(0.5);

    // 获取主摄像机
    const camera = this.cameras.main;

    // 设置摄像机旋转中心点为场景中心
    camera.setOrigin(0.5, 0.5);

    // 创建旋转动画
    this.tweens.add({
      targets: camera,
      rotation: Math.PI * 2, // 旋转 360 度（2π 弧度）
      duration: 1000, // 持续 1 秒
      ease: 'Cubic.easeInOut', // 使用缓动效果使旋转更平滑
      onUpdate: (tween) => {
        // 更新旋转进度
        this.rotationProgress = Math.floor(tween.progress * 100);
        this.statusText.setText(`Rotating: ${this.rotationProgress}%`);
      },
      onComplete: () => {
        // 旋转完成
        this.rotationComplete = true;
        this.rotationProgress = 100;
        this.statusText.setText('Rotation Complete!');
        this.statusText.setColor('#00ff00');

        // 重置摄像机旋转为 0，避免累积
        camera.setRotation(0);

        // 3 秒后可以重新触发旋转（可选）
        this.time.delayedCall(3000, () => {
          this.restartRotation();
        });
      }
    });

    // 添加交互提示
    const hintText = this.add.text(width / 2, height - 100, 'Click to restart rotation', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#95a5a6'
    });
    hintText.setOrigin(0.5);
    hintText.setAlpha(0);

    // 旋转完成后显示提示
    this.time.delayedCall(1000, () => {
      this.tweens.add({
        targets: hintText,
        alpha: 1,
        duration: 500
      });
    });

    // 点击重启旋转
    this.input.on('pointerdown', () => {
      if (this.rotationComplete) {
        this.restartRotation();
      }
    });
  }

  restartRotation() {
    // 重置状态
    this.rotationComplete = false;
    this.rotationProgress = 0;
    this.statusText.setText('Rotating: 0%');
    this.statusText.setColor('#4ecdc4');

    const camera = this.cameras.main;
    camera.setRotation(0);

    // 重新创建旋转动画
    this.tweens.add({
      targets: camera,
      rotation: Math.PI * 2,
      duration: 1000,
      ease: 'Cubic.easeInOut',
      onUpdate: (tween) => {
        this.rotationProgress = Math.floor(tween.progress * 100);
        this.statusText.setText(`Rotating: ${this.rotationProgress}%`);
      },
      onComplete: () => {
        this.rotationComplete = true;
        this.rotationProgress = 100;
        this.statusText.setText('Rotation Complete!');
        this.statusText.setColor('#00ff00');
        camera.setRotation(0);
      }
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
  scene: GameScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);