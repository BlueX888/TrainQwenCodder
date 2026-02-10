class ShakeScene extends Phaser.Scene {
  constructor() {
    super('ShakeScene');
    this.animationComplete = false; // 状态信号：动画是否完成
    this.shakeCount = 0; // 状态信号：抖动次数计数
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 创建3个不同颜色的矩形纹理
    this.createRectTexture('rect1', 80, 80, 0xff0000); // 红色
    this.createRectTexture('rect2', 80, 80, 0x00ff00); // 绿色
    this.createRectTexture('rect3', 80, 80, 0x0000ff); // 蓝色

    // 创建3个精灵对象，水平排列
    const spacing = 150;
    const startX = width / 2 - spacing;
    const centerY = height / 2;

    this.object1 = this.add.sprite(startX, centerY, 'rect1');
    this.object2 = this.add.sprite(startX + spacing, centerY, 'rect2');
    this.object3 = this.add.sprite(startX + spacing * 2, centerY, 'rect3');

    // 存储初始位置
    this.initialPositions = [
      { x: this.object1.x, y: this.object1.y },
      { x: this.object2.x, y: this.object2.y },
      { x: this.object3.x, y: this.object3.y }
    ];

    // 添加标题文本
    this.add.text(width / 2, 50, '3个物体同步抖动动画', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 添加状态显示文本
    this.statusText = this.add.text(width / 2, height - 50, '抖动中...', {
      fontSize: '20px',
      color: '#ffff00'
    }).setOrigin(0.5);

    // 创建抖动动画
    this.startShakeAnimation();

    // 2.5秒后停止动画
    this.time.delayedCall(2500, () => {
      this.stopShakeAnimation();
    });
  }

  /**
   * 使用 Graphics 创建矩形纹理
   */
  createRectTexture(key, width, height, color) {
    const graphics = this.add.graphics();
    graphics.fillStyle(color, 1);
    graphics.fillRect(0, 0, width, height);
    
    // 添加边框
    graphics.lineStyle(3, 0xffffff, 1);
    graphics.strokeRect(0, 0, width, height);
    
    graphics.generateTexture(key, width, height);
    graphics.destroy();
  }

  /**
   * 开始抖动动画
   */
  startShakeAnimation() {
    const shakeIntensity = 10; // 抖动强度（像素）
    const shakeDuration = 50; // 单次抖动持续时间（毫秒）

    // 为3个物体创建同步的抖动补间动画
    const objects = [this.object1, this.object2, this.object3];
    this.shakeTweens = [];

    objects.forEach((obj, index) => {
      const initialPos = this.initialPositions[index];
      
      // 创建X轴抖动
      const tweenX = this.tweens.add({
        targets: obj,
        x: {
          from: initialPos.x - shakeIntensity,
          to: initialPos.x + shakeIntensity
        },
        duration: shakeDuration,
        yoyo: true,
        repeat: -1, // 无限重复
        ease: 'Sine.easeInOut',
        onRepeat: () => {
          if (index === 0) { // 只在第一个物体时计数
            this.shakeCount++;
          }
        }
      });

      // 创建Y轴抖动
      const tweenY = this.tweens.add({
        targets: obj,
        y: {
          from: initialPos.y - shakeIntensity,
          to: initialPos.y + shakeIntensity
        },
        duration: shakeDuration * 0.7, // 不同频率产生更自然的抖动
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      this.shakeTweens.push(tweenX, tweenY);
    });
  }

  /**
   * 停止抖动动画
   */
  stopShakeAnimation() {
    // 停止所有补间动画
    if (this.shakeTweens) {
      this.shakeTweens.forEach(tween => {
        tween.stop();
      });
    }

    // 将物体恢复到初始位置
    this.object1.setPosition(this.initialPositions[0].x, this.initialPositions[0].y);
    this.object2.setPosition(this.initialPositions[1].x, this.initialPositions[1].y);
    this.object3.setPosition(this.initialPositions[2].x, this.initialPositions[2].y);

    // 更新状态
    this.animationComplete = true;
    this.statusText.setText(`动画完成！总抖动次数: ${this.shakeCount}`);
    this.statusText.setColor('#00ff00');

    // 添加完成提示
    const completeText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 100,
      '✓ 抖动已停止',
      {
        fontSize: '28px',
        color: '#00ff00',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 }
      }
    ).setOrigin(0.5);

    // 完成文本淡入效果
    completeText.setAlpha(0);
    this.tweens.add({
      targets: completeText,
      alpha: 1,
      duration: 500,
      ease: 'Power2'
    });

    console.log('Animation complete! Shake count:', this.shakeCount);
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
  backgroundColor: '#2d2d2d',
  scene: ShakeScene,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

// 创建游戏实例
new Phaser.Game(config);