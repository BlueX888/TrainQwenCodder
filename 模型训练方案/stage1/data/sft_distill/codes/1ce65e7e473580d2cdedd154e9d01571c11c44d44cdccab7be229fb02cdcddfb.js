class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    this.gravityDirection = 'down'; // 状态信号：当前重力方向
    this.switchCount = 0; // 状态信号：重力切换次数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const GRAVITY_STRENGTH = 300;
    
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0066ff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建物体纹理（红色圆形）
    const objectGraphics = this.add.graphics();
    objectGraphics.fillStyle(0xff3333, 1);
    objectGraphics.fillCircle(15, 15, 15);
    objectGraphics.generateTexture('object', 30, 30);
    objectGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 100, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.3);

    // 创建12个物体（使用固定种子布局）
    this.objects = this.physics.add.group();
    const positions = [
      [150, 150], [250, 200], [350, 150], [450, 200],
      [550, 150], [650, 200], [200, 350], [300, 400],
      [400, 350], [500, 400], [600, 350], [700, 400]
    ];

    positions.forEach(([x, y]) => {
      const obj = this.objects.create(x, y, 'object');
      obj.setCollideWorldBounds(true);
      obj.setBounce(0.4);
    });

    // 设置物体之间的碰撞
    this.physics.add.collider(this.player, this.objects);
    this.physics.add.collider(this.objects, this.objects);

    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加显示文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateInfoText();

    // 添加按键说明
    this.add.text(10, 550, '使用方向键切换重力方向', {
      fontSize: '16px',
      fill: '#ffff00'
    });
  }

  update() {
    const GRAVITY_STRENGTH = 300;

    // 检测方向键按下并切换重力
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.setGravity(0, -GRAVITY_STRENGTH, 'up');
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.setGravity(0, GRAVITY_STRENGTH, 'down');
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      this.setGravity(-GRAVITY_STRENGTH, 0, 'left');
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      this.setGravity(GRAVITY_STRENGTH, 0, 'right');
    }
  }

  setGravity(x, y, direction) {
    // 设置世界重力
    this.physics.world.gravity.x = x;
    this.physics.world.gravity.y = y;
    
    // 更新状态
    this.gravityDirection = direction;
    this.switchCount++;
    
    // 更新显示
    this.updateInfoText();
    
    // 给所有物体一个小的初始速度，使效果更明显
    this.player.setVelocity(0, 0);
    this.objects.children.entries.forEach(obj => {
      obj.setVelocity(
        Phaser.Math.Between(-20, 20),
        Phaser.Math.Between(-20, 20)
      );
    });
  }

  updateInfoText() {
    this.infoText.setText([
      `重力方向: ${this.gravityDirection.toUpperCase()}`,
      `切换次数: ${this.switchCount}`,
      `物体数量: ${this.objects.children.size + 1}`
    ]);
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
      gravity: { x: 0, y: 300 },
      debug: false
    }
  },
  scene: GravityScene
};

new Phaser.Game(config);