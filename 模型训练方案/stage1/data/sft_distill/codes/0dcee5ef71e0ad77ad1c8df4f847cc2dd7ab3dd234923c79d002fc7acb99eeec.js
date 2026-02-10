// 四向重力切换游戏
class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    this.gravityDirection = 'down'; // 当前重力方向
    this.gravitySwitchCount = 0; // 重力切换次数（可验证状态）
    this.gravityMagnitude = 200; // 重力大小
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建物体纹理（红色圆形）
    const objectGraphics = this.add.graphics();
    objectGraphics.fillStyle(0xff0000, 1);
    objectGraphics.fillCircle(15, 15, 15);
    objectGraphics.generateTexture('object', 30, 30);
    objectGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 100, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.3);

    // 创建8个物体，使用固定位置确保确定性
    this.objects = [];
    const positions = [
      { x: 150, y: 150 },
      { x: 650, y: 150 },
      { x: 150, y: 450 },
      { x: 650, y: 450 },
      { x: 300, y: 250 },
      { x: 500, y: 250 },
      { x: 300, y: 350 },
      { x: 500, y: 350 }
    ];

    positions.forEach(pos => {
      const obj = this.physics.add.sprite(pos.x, pos.y, 'object');
      obj.setCollideWorldBounds(true);
      obj.setBounce(0.5);
      this.objects.push(obj);
    });

    // 设置物体之间的碰撞
    this.physics.add.collider(this.player, this.objects);
    this.physics.add.collider(this.objects, this.objects);

    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加按键释放监听（防止连续触发）
    this.lastKeyPressed = null;

    // 创建UI显示当前重力方向和切换次数
    this.gravityText = this.add.text(16, 16, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateGravityText();

    // 添加说明文字
    this.add.text(16, 560, 'Use Arrow Keys to Switch Gravity Direction', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 初始化重力方向
    this.setGravity('down');
  }

  update() {
    // 检测方向键按下并切换重力
    if (this.cursors.up.isDown && this.lastKeyPressed !== 'up') {
      this.setGravity('up');
      this.lastKeyPressed = 'up';
      this.gravitySwitchCount++;
      this.updateGravityText();
    } else if (this.cursors.down.isDown && this.lastKeyPressed !== 'down') {
      this.setGravity('down');
      this.lastKeyPressed = 'down';
      this.gravitySwitchCount++;
      this.updateGravityText();
    } else if (this.cursors.left.isDown && this.lastKeyPressed !== 'left') {
      this.setGravity('left');
      this.lastKeyPressed = 'left';
      this.gravitySwitchCount++;
      this.updateGravityText();
    } else if (this.cursors.right.isDown && this.lastKeyPressed !== 'right') {
      this.setGravity('right');
      this.lastKeyPressed = 'right';
      this.gravitySwitchCount++;
      this.updateGravityText();
    }

    // 重置按键状态
    if (!this.cursors.up.isDown && !this.cursors.down.isDown && 
        !this.cursors.left.isDown && !this.cursors.right.isDown) {
      this.lastKeyPressed = null;
    }
  }

  setGravity(direction) {
    this.gravityDirection = direction;
    const world = this.physics.world;

    switch (direction) {
      case 'up':
        world.gravity.x = 0;
        world.gravity.y = -this.gravityMagnitude;
        break;
      case 'down':
        world.gravity.x = 0;
        world.gravity.y = this.gravityMagnitude;
        break;
      case 'left':
        world.gravity.x = -this.gravityMagnitude;
        world.gravity.y = 0;
        break;
      case 'right':
        world.gravity.x = this.gravityMagnitude;
        world.gravity.y = 0;
        break;
    }
  }

  updateGravityText() {
    this.gravityText.setText(
      `Gravity: ${this.gravityDirection.toUpperCase()} | Switches: ${this.gravitySwitchCount}`
    );
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
      gravity: { y: 200 },
      debug: false
    }
  },
  scene: GravityScene
};

// 创建游戏实例
const game = new Phaser.Game(config);