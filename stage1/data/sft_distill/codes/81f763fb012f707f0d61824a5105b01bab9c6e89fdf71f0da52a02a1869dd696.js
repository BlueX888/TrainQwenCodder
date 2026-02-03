// 四向重力切换游戏
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
    const { width, height } = this.cameras.main;
    
    // 创建纹理
    this.createTextures();
    
    // 创建玩家
    this.player = this.physics.add.sprite(width / 2, height / 2, 'playerTex');
    this.player.setBounce(0.3);
    this.player.setCollideWorldBounds(true);
    
    // 创建8个物体
    this.objects = [];
    const positions = [
      { x: 100, y: 100 },
      { x: 700, y: 100 },
      { x: 100, y: 500 },
      { x: 700, y: 500 },
      { x: 400, y: 150 },
      { x: 200, y: 300 },
      { x: 600, y: 300 },
      { x: 400, y: 450 }
    ];
    
    for (let i = 0; i < 8; i++) {
      const obj = this.physics.add.sprite(
        positions[i].x,
        positions[i].y,
        'objectTex'
      );
      obj.setBounce(0.4);
      obj.setCollideWorldBounds(true);
      this.objects.push(obj);
    }
    
    // 设置物体间碰撞
    this.physics.add.collider(this.player, this.objects);
    this.physics.add.collider(this.objects, this.objects);
    
    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 上一帧的按键状态
    this.lastKeys = {
      up: false,
      down: false,
      left: false,
      right: false
    };
    
    // 创建UI文本显示当前重力方向
    this.gravityText = this.add.text(10, 10, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateGravityText();
    
    // 创建提示文本
    this.add.text(10, 50, 'Press Arrow Keys to Change Gravity', {
      fontSize: '16px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  createTextures() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0066ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('playerTex', 32, 32);
    playerGraphics.destroy();
    
    // 创建物体纹理（红色圆形）
    const objectGraphics = this.add.graphics();
    objectGraphics.fillStyle(0xff3333, 1);
    objectGraphics.fillCircle(16, 16, 16);
    objectGraphics.generateTexture('objectTex', 32, 32);
    objectGraphics.destroy();
  }

  update() {
    // 检测按键按下事件（边缘触发）
    if (this.cursors.up.isDown && !this.lastKeys.up) {
      this.setGravity('up');
    } else if (this.cursors.down.isDown && !this.lastKeys.down) {
      this.setGravity('down');
    } else if (this.cursors.left.isDown && !this.lastKeys.left) {
      this.setGravity('left');
    } else if (this.cursors.right.isDown && !this.lastKeys.right) {
      this.setGravity('right');
    }
    
    // 更新按键状态
    this.lastKeys.up = this.cursors.up.isDown;
    this.lastKeys.down = this.cursors.down.isDown;
    this.lastKeys.left = this.cursors.left.isDown;
    this.lastKeys.right = this.cursors.right.isDown;
  }

  setGravity(direction) {
    const gravityStrength = 600;
    
    // 只在方向改变时更新
    if (this.gravityDirection === direction) {
      return;
    }
    
    this.gravityDirection = direction;
    this.switchCount++;
    
    // 设置世界重力
    switch (direction) {
      case 'up':
        this.physics.world.gravity.x = 0;
        this.physics.world.gravity.y = -gravityStrength;
        break;
      case 'down':
        this.physics.world.gravity.x = 0;
        this.physics.world.gravity.y = gravityStrength;
        break;
      case 'left':
        this.physics.world.gravity.x = -gravityStrength;
        this.physics.world.gravity.y = 0;
        break;
      case 'right':
        this.physics.world.gravity.x = gravityStrength;
        this.physics.world.gravity.y = 0;
        break;
    }
    
    this.updateGravityText();
  }

  updateGravityText() {
    const arrows = {
      up: '↑',
      down: '↓',
      left: '←',
      right: '→'
    };
    this.gravityText.setText(
      `Gravity: ${arrows[this.gravityDirection]} ${this.gravityDirection.toUpperCase()} | Switches: ${this.switchCount}`
    );
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 600 }, // 初始重力向下
      debug: false
    }
  },
  scene: GravityScene
};

// 创建游戏实例
const game = new Phaser.Game(config);