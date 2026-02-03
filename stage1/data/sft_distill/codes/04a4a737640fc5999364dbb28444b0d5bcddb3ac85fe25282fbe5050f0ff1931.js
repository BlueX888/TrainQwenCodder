class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    this.gravityDirection = 'down'; // 状态信号：当前重力方向
    this.switchCount = 0; // 状态信号：切换次数
  }

  preload() {
    // 使用Graphics生成纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建物体纹理（红色圆形）
    const objectGraphics = this.add.graphics();
    objectGraphics.fillStyle(0xff0000, 1);
    objectGraphics.fillCircle(16, 16, 16);
    objectGraphics.generateTexture('object', 32, 32);
    objectGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 100, 'player');
    this.player.setBounce(0.3);
    this.player.setCollideWorldBounds(true);

    // 创建8个物体（使用固定位置确保确定性）
    this.objects = this.physics.add.group();
    const positions = [
      { x: 100, y: 150 },
      { x: 200, y: 200 },
      { x: 300, y: 150 },
      { x: 500, y: 200 },
      { x: 600, y: 150 },
      { x: 700, y: 200 },
      { x: 150, y: 300 },
      { x: 650, y: 300 }
    ];

    positions.forEach(pos => {
      const obj = this.objects.create(pos.x, pos.y, 'object');
      obj.setBounce(0.4);
      obj.setCollideWorldBounds(true);
    });

    // 设置物体间碰撞
    this.physics.add.collider(this.player, this.objects);
    this.physics.add.collider(this.objects, this.objects);

    // 创建方向键
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加额外的WASD键支持
    this.keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      down: Phaser.Input.Keyboard.KeyCodes.DOWN,
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      w: Phaser.Input.Keyboard.KeyCodes.W,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      d: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 显示提示文本
    this.add.text(10, 10, 'Press Arrow Keys to Switch Gravity', {
      fontSize: '18px',
      fill: '#ffffff'
    });

    // 显示状态信息
    this.statusText = this.add.text(10, 40, '', {
      fontSize: '16px',
      fill: '#00ff00'
    });

    this.updateStatusText();
  }

  update() {
    // 检测方向键按下并切换重力
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up) || 
        Phaser.Input.Keyboard.JustDown(this.keys.w)) {
      this.setGravity(0, -300, 'up');
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down) || 
               Phaser.Input.Keyboard.JustDown(this.keys.s)) {
      this.setGravity(0, 300, 'down');
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.left) || 
               Phaser.Input.Keyboard.JustDown(this.keys.a)) {
      this.setGravity(-300, 0, 'left');
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right) || 
               Phaser.Input.Keyboard.JustDown(this.keys.d)) {
      this.setGravity(300, 0, 'right');
    }
  }

  setGravity(x, y, direction) {
    // 设置世界重力，影响所有物理对象
    this.physics.world.gravity.x = x;
    this.physics.world.gravity.y = y;
    
    // 更新状态
    this.gravityDirection = direction;
    this.switchCount++;
    
    // 更新显示
    this.updateStatusText();
    
    // 给所有对象一个小的初始速度，让效果更明显
    const impulse = 50;
    if (direction === 'up') {
      this.player.setVelocityY(-impulse);
    } else if (direction === 'down') {
      this.player.setVelocityY(impulse);
    } else if (direction === 'left') {
      this.player.setVelocityX(-impulse);
    } else if (direction === 'right') {
      this.player.setVelocityX(impulse);
    }
  }

  updateStatusText() {
    this.statusText.setText(
      `Gravity: ${this.gravityDirection.toUpperCase()} | ` +
      `Switches: ${this.switchCount} | ` +
      `Objects: ${this.objects.getChildren().length + 1}`
    );
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 }, // 初始重力向下300
      debug: false
    }
  },
  scene: GravityScene
};

new Phaser.Game(config);