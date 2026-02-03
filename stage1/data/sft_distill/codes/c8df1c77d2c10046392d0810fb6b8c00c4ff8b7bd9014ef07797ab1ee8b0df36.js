class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.objects = [];
    this.totalDistance = 0; // 可验证的状态信号：总移动距离
    this.activeObjects = 20; // 可验证的状态信号：活动对象数量
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建粉色圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF69B4, 1); // 粉色
    graphics.fillCircle(20, 20, 20); // 半径20的圆形
    graphics.generateTexture('pinkCircle', 40, 40);
    graphics.destroy();

    // 创建20个粉色对象并随机分布
    for (let i = 0; i < 20; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const obj = this.add.sprite(x, y, 'pinkCircle');
      obj.setData('id', i); // 为每个对象设置ID
      this.objects.push(obj);
    }

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加说明文本
    this.add.text(10, 560, '使用方向键控制所有粉色圆形同步移动', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });

    this.updateStatusText();
  }

  update(time, delta) {
    // 计算移动速度（240像素/秒）
    const speed = 240;
    const velocity = {
      x: 0,
      y: 0
    };

    // 检测方向键输入
    if (this.cursors.left.isDown) {
      velocity.x = -speed;
    } else if (this.cursors.right.isDown) {
      velocity.x = speed;
    }

    if (this.cursors.up.isDown) {
      velocity.y = -speed;
    } else if (this.cursors.down.isDown) {
      velocity.y = speed;
    }

    // 如果有移动输入，更新所有对象位置
    if (velocity.x !== 0 || velocity.y !== 0) {
      const deltaSeconds = delta / 1000;
      const moveX = velocity.x * deltaSeconds;
      const moveY = velocity.y * deltaSeconds;

      // 计算本次移动的距离
      const distance = Math.sqrt(moveX * moveX + moveY * moveY);
      this.totalDistance += distance;

      // 同步移动所有对象
      this.objects.forEach(obj => {
        obj.x += moveX;
        obj.y += moveY;

        // 边界处理：环绕屏幕
        if (obj.x < -20) obj.x = 820;
        if (obj.x > 820) obj.x = -20;
        if (obj.y < -20) obj.y = 620;
        if (obj.y > 620) obj.y = -20;
      });

      this.updateStatusText();
    }
  }

  updateStatusText() {
    this.statusText.setText(
      `活动对象: ${this.activeObjects}\n` +
      `总移动距离: ${Math.floor(this.totalDistance)}px\n` +
      `第一个对象位置: (${Math.floor(this.objects[0].x)}, ${Math.floor(this.objects[0].y)})`
    );
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene
};

new Phaser.Game(config);