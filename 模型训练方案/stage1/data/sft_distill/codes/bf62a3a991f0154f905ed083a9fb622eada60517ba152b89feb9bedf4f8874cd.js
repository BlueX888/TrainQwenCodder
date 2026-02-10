class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    this.gravitySwitchCount = 0; // 状态信号：重力切换次数
    this.currentGravityDirection = 'down'; // 当前重力方向
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x3498db, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建物体纹理（红色圆形）
    const objectGraphics = this.add.graphics();
    objectGraphics.fillStyle(0xe74c3c, 1);
    objectGraphics.fillCircle(12, 12, 12);
    objectGraphics.generateTexture('object', 24, 24);
    objectGraphics.destroy();

    // 创建地面纹理（灰色矩形）
    const groundGraphics = this.add.graphics();
    groundGraphics.fillStyle(0x7f8c8d, 1);
    groundGraphics.fillRect(0, 0, 800, 40);
    groundGraphics.generateTexture('ground', 800, 40);
    groundGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 100, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.3);

    // 创建 15 个物理物体
    this.objects = this.physics.add.group();
    
    // 使用固定种子生成位置（确定性）
    const seed = 12345;
    let random = seed;
    const seededRandom = () => {
      random = (random * 9301 + 49297) % 233280;
      return random / 233280;
    };

    for (let i = 0; i < 15; i++) {
      const x = 50 + seededRandom() * 700;
      const y = 50 + seededRandom() * 200;
      const obj = this.objects.create(x, y, 'object');
      obj.setBounce(0.5);
      obj.setCollideWorldBounds(true);
    }

    // 创建静态地面（四周边界）
    this.grounds = this.physics.add.staticGroup();
    
    // 底部地面
    const bottomGround = this.grounds.create(400, 590, 'ground');
    bottomGround.setScale(1, 0.25).refreshBody();
    
    // 顶部地面
    const topGround = this.grounds.create(400, 10, 'ground');
    topGround.setScale(1, 0.25).refreshBody();
    
    // 左侧墙
    const leftWall = this.add.graphics();
    leftWall.fillStyle(0x7f8c8d, 1);
    leftWall.fillRect(0, 0, 40, 600);
    leftWall.generateTexture('leftWall', 40, 600);
    leftWall.destroy();
    const leftGround = this.grounds.create(10, 300, 'leftWall');
    leftGround.setScale(0.25, 1).refreshBody();
    
    // 右侧墙
    const rightGround = this.grounds.create(790, 300, 'leftWall');
    rightGround.setScale(0.25, 1).refreshBody();

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.grounds);
    this.physics.add.collider(this.objects, this.grounds);
    this.physics.add.collider(this.player, this.objects);
    this.physics.add.collider(this.objects, this.objects);

    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加文本显示
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#fff',
      backgroundColor: '#000',
      padding: { x: 10, y: 5 }
    });
    this.updateInfoText();

    // 添加说明文本
    this.add.text(10, 560, 'Use Arrow Keys to Switch Gravity Direction', {
      fontSize: '14px',
      fill: '#fff',
      backgroundColor: '#000',
      padding: { x: 5, y: 3 }
    });
  }

  update() {
    // 检测方向键按下并切换重力
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.setGravity(0, -1000, 'up');
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.setGravity(0, 1000, 'down');
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      this.setGravity(-1000, 0, 'left');
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      this.setGravity(1000, 0, 'right');
    }
  }

  setGravity(x, y, direction) {
    // 设置世界重力
    this.physics.world.gravity.x = x;
    this.physics.world.gravity.y = y;
    
    // 更新状态
    this.currentGravityDirection = direction;
    this.gravitySwitchCount++;
    
    // 更新显示
    this.updateInfoText();
    
    // 给玩家一个初始推力，让效果更明显
    const force = 200;
    switch(direction) {
      case 'up':
        this.player.setVelocityY(-force);
        break;
      case 'down':
        this.player.setVelocityY(force);
        break;
      case 'left':
        this.player.setVelocityX(-force);
        break;
      case 'right':
        this.player.setVelocityX(force);
        break;
    }
  }

  updateInfoText() {
    this.infoText.setText([
      `Gravity Direction: ${this.currentGravityDirection.toUpperCase()}`,
      `Switch Count: ${this.gravitySwitchCount}`,
      `Gravity: (${this.physics.world.gravity.x}, ${this.physics.world.gravity.y})`
    ]);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2c3e50',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 1000 }, // 初始重力向下
      debug: false
    }
  },
  scene: GravityScene
};

new Phaser.Game(config);