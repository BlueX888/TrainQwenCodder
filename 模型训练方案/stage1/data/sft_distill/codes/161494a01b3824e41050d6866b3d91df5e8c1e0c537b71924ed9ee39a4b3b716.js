// 四向重力切换游戏
class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    this.gravityDirection = 'down'; // 状态信号：当前重力方向
    this.gravityMagnitude = 600;
    this.switchCount = 0; // 状态信号：切换次数
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建物体纹理
    const objectGraphics = this.add.graphics();
    objectGraphics.fillStyle(0xff6600, 1);
    objectGraphics.fillRect(0, 0, 24, 24);
    objectGraphics.generateTexture('object', 24, 24);
    objectGraphics.destroy();

    // 创建玩家（绿色圆形）
    this.player = this.physics.add.sprite(400, 100, 'player');
    this.player.setBounce(0.3);
    this.player.setCollideWorldBounds(true);

    // 创建8个物体（橙色方块）
    this.objects = this.physics.add.group();
    
    // 使用固定种子生成位置，保证确定性
    const positions = [
      { x: 150, y: 150 },
      { x: 650, y: 150 },
      { x: 200, y: 300 },
      { x: 600, y: 300 },
      { x: 300, y: 200 },
      { x: 500, y: 200 },
      { x: 250, y: 450 },
      { x: 550, y: 450 }
    ];

    positions.forEach(pos => {
      const obj = this.objects.create(pos.x, pos.y, 'object');
      obj.setBounce(0.4);
      obj.setCollideWorldBounds(true);
    });

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.objects);
    this.physics.add.collider(this.objects, this.objects);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加说明文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加重力方向指示器
    this.gravityIndicator = this.add.graphics();

    // 初始化重力
    this.updateGravity('down');
    this.updateInfoText();
  }

  update(time, delta) {
    // 检测方向键按下并切换重力
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.updateGravity('up');
      this.switchCount++;
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.updateGravity('down');
      this.switchCount++;
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      this.updateGravity('left');
      this.switchCount++;
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      this.updateGravity('right');
      this.switchCount++;
    }

    // 更新信息显示
    this.updateInfoText();
    this.drawGravityIndicator();
  }

  updateGravity(direction) {
    this.gravityDirection = direction;
    
    const gravity = { x: 0, y: 0 };
    
    switch (direction) {
      case 'up':
        gravity.y = -this.gravityMagnitude;
        break;
      case 'down':
        gravity.y = this.gravityMagnitude;
        break;
      case 'left':
        gravity.x = -this.gravityMagnitude;
        break;
      case 'right':
        gravity.x = this.gravityMagnitude;
        break;
    }

    // 设置世界重力
    this.physics.world.gravity.x = gravity.x;
    this.physics.world.gravity.y = gravity.y;
  }

  updateInfoText() {
    const objectCount = this.objects.getChildren().length;
    this.infoText.setText([
      `Gravity Direction: ${this.gravityDirection.toUpperCase()}`,
      `Gravity Magnitude: ${this.gravityMagnitude}`,
      `Switch Count: ${this.switchCount}`,
      `Objects: ${objectCount}`,
      `Player Pos: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      '',
      'Press Arrow Keys to Change Gravity'
    ]);
  }

  drawGravityIndicator() {
    this.gravityIndicator.clear();
    this.gravityIndicator.lineStyle(4, 0xffff00, 1);
    this.gravityIndicator.fillStyle(0xffff00, 1);

    const centerX = 750;
    const centerY = 550;
    const arrowLength = 30;

    // 绘制箭头指示重力方向
    let endX = centerX;
    let endY = centerY;

    switch (this.gravityDirection) {
      case 'up':
        endY = centerY - arrowLength;
        break;
      case 'down':
        endY = centerY + arrowLength;
        break;
      case 'left':
        endX = centerX - arrowLength;
        break;
      case 'right':
        endX = centerX + arrowLength;
        break;
    }

    // 绘制箭头线
    this.gravityIndicator.beginPath();
    this.gravityIndicator.moveTo(centerX, centerY);
    this.gravityIndicator.lineTo(endX, endY);
    this.gravityIndicator.strokePath();

    // 绘制箭头头部
    const angle = Math.atan2(endY - centerY, endX - centerX);
    const arrowHeadLength = 10;
    
    this.gravityIndicator.beginPath();
    this.gravityIndicator.moveTo(endX, endY);
    this.gravityIndicator.lineTo(
      endX - arrowHeadLength * Math.cos(angle - Math.PI / 6),
      endY - arrowHeadLength * Math.sin(angle - Math.PI / 6)
    );
    this.gravityIndicator.lineTo(
      endX - arrowHeadLength * Math.cos(angle + Math.PI / 6),
      endY - arrowHeadLength * Math.sin(angle + Math.PI / 6)
    );
    this.gravityIndicator.closePath();
    this.gravityIndicator.fillPath();
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 600 },
      debug: false
    }
  },
  scene: GravityScene
};

// 创建游戏实例
const game = new Phaser.Game(config);