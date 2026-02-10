class ShakeScene extends Phaser.Scene {
  constructor() {
    super('ShakeScene');
    this.isShaking = false; // 状态信号：是否正在抖动
    this.objectCount = 10; // 物体数量
    this.shakeDuration = 3000; // 抖动持续时间（毫秒）
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建背景文字提示
    this.add.text(400, 50, '10 Objects Shaking Animation', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 状态显示文本
    this.statusText = this.add.text(400, 100, 'Status: Idle', {
      fontSize: '18px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 创建用于绘制圆形的纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(20, 20, 20);
    graphics.generateTexture('circle', 40, 40);
    graphics.destroy();

    // 存储所有物体和对应的 tween
    this.objects = [];
    this.tweens = [];

    // 创建10个物体，排列成两行
    const startX = 200;
    const startY = 250;
    const spacingX = 80;
    const spacingY = 150;
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 
                    0x00ffff, 0xff8800, 0x8800ff, 0x00ff88, 0xff0088];

    for (let i = 0; i < this.objectCount; i++) {
      const row = Math.floor(i / 5);
      const col = i % 5;
      const x = startX + col * spacingX;
      const y = startY + row * spacingY;

      // 创建彩色圆形
      const colorGraphics = this.add.graphics();
      colorGraphics.fillStyle(colors[i], 1);
      colorGraphics.fillCircle(20, 20, 20);
      colorGraphics.generateTexture(`circle${i}`, 40, 40);
      colorGraphics.destroy();

      const obj = this.add.sprite(x, y, `circle${i}`);
      obj.setData('originalX', x);
      obj.setData('originalY', y);
      obj.setData('index', i);
      
      this.objects.push(obj);
    }

    // 开始抖动动画
    this.startShaking();

    // 3秒后停止抖动
    this.time.delayedCall(this.shakeDuration, () => {
      this.stopShaking();
    });
  }

  startShaking() {
    this.isShaking = true;
    this.statusText.setText('Status: Shaking...');
    this.statusText.setColor('#ff0000');

    // 为每个物体创建抖动动画
    this.objects.forEach((obj, index) => {
      const originalX = obj.getData('originalX');
      const originalY = obj.getData('originalY');

      // 创建 X 轴抖动
      const tweenX = this.tweens.add({
        targets: obj,
        x: {
          from: originalX - 10,
          to: originalX + 10
        },
        duration: 100,
        yoyo: true,
        repeat: -1, // 无限重复
        ease: 'Sine.easeInOut'
      });

      // 创建 Y 轴抖动
      const tweenY = this.tweens.add({
        targets: obj,
        y: {
          from: originalY - 8,
          to: originalY + 8
        },
        duration: 120,
        yoyo: true,
        repeat: -1, // 无限重复
        ease: 'Sine.easeInOut'
      });

      // 添加轻微的旋转抖动
      const tweenRotation = this.tweens.add({
        targets: obj,
        angle: {
          from: -15,
          to: 15
        },
        duration: 150,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      this.tweens.push(tweenX, tweenY, tweenRotation);
    });
  }

  stopShaking() {
    this.isShaking = false;
    this.statusText.setText('Status: Stopped');
    this.statusText.setColor('#00ff00');

    // 停止所有 tween
    this.tweens.forEach(tween => {
      tween.stop();
    });

    // 将所有物体恢复到原始位置
    this.objects.forEach(obj => {
      const originalX = obj.getData('originalX');
      const originalY = obj.getData('originalY');
      
      // 使用平滑动画恢复位置
      this.tweens.add({
        targets: obj,
        x: originalX,
        y: originalY,
        angle: 0,
        duration: 300,
        ease: 'Power2'
      });
    });

    // 显示完成提示
    const completeText = this.add.text(400, 550, 'Animation Complete!', {
      fontSize: '20px',
      color: '#ffff00'
    }).setOrigin(0.5);

    // 闪烁效果
    this.tweens.add({
      targets: completeText,
      alpha: { from: 0, to: 1 },
      duration: 500,
      yoyo: true,
      repeat: 3
    });
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
    // 例如：显示剩余时间等
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: ShakeScene
};

new Phaser.Game(config);