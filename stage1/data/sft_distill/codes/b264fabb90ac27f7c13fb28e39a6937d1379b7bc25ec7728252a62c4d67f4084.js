// 全局信号记录
window.__signals__ = {
  gravityChanges: [],
  playerPosition: { x: 0, y: 0 },
  currentGravity: { x: 0, y: 1000 }
};

class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    this.gravityDirection = 'DOWN'; // 初始方向
    this.gravityMagnitude = 1000;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（使用Graphics）
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.3);
    
    // 设置初始重力（向下）
    this.player.body.setGravity(0, this.gravityMagnitude);

    // 创建键盘输入
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    // 监听按键按下事件
    this.keyW.on('down', () => this.setGravityDirection('UP'));
    this.keyA.on('down', () => this.setGravityDirection('LEFT'));
    this.keyS.on('down', () => this.setGravityDirection('DOWN'));
    this.keyD.on('down', () => this.setGravityDirection('RIGHT'));

    // 创建方向显示文本
    this.directionText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateDirectionText();

    // 创建提示文本
    this.add.text(16, 560, 'Press WASD to change gravity direction', {
      fontSize: '18px',
      fill: '#cccccc'
    });

    // 创建边界可视化
    const bounds = this.add.graphics();
    bounds.lineStyle(4, 0xff0000, 1);
    bounds.strokeRect(2, 2, 796, 596);

    // 初始化信号
    this.recordGravityChange();
  }

  setGravityDirection(direction) {
    this.gravityDirection = direction;
    
    // 重置重力
    this.player.body.setGravity(0, 0);
    
    // 根据方向设置重力
    switch (direction) {
      case 'UP':
        this.player.body.setGravity(0, -this.gravityMagnitude);
        break;
      case 'DOWN':
        this.player.body.setGravity(0, this.gravityMagnitude);
        break;
      case 'LEFT':
        this.player.body.setGravity(-this.gravityMagnitude, 0);
        break;
      case 'RIGHT':
        this.player.body.setGravity(this.gravityMagnitude, 0);
        break;
    }
    
    this.updateDirectionText();
    this.recordGravityChange();
  }

  updateDirectionText() {
    const arrows = {
      'UP': '↑',
      'DOWN': '↓',
      'LEFT': '←',
      'RIGHT': '→'
    };
    
    this.directionText.setText(
      `Gravity: ${this.gravityDirection} ${arrows[this.gravityDirection]}\n` +
      `Magnitude: ${this.gravityMagnitude}`
    );
  }

  recordGravityChange() {
    const gravityData = {
      direction: this.gravityDirection,
      x: this.player.body.gravity.x,
      y: this.player.body.gravity.y,
      timestamp: Date.now()
    };
    
    window.__signals__.gravityChanges.push(gravityData);
    window.__signals__.currentGravity = {
      x: this.player.body.gravity.x,
      y: this.player.body.gravity.y
    };
    
    console.log('Gravity changed:', JSON.stringify(gravityData));
  }

  update(time, delta) {
    // 更新玩家位置信号
    window.__signals__.playerPosition = {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y)
    };
    
    // 每秒记录一次位置（用于验证）
    if (!this.lastLogTime || time - this.lastLogTime > 1000) {
      this.lastLogTime = time;
      console.log('Player position:', JSON.stringify(window.__signals__.playerPosition));
    }
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
      gravity: { x: 0, y: 0 }, // 世界重力设为0，通过Body控制
      debug: false
    }
  },
  scene: GravityScene
};

// 启动游戏
const game = new Phaser.Game(config);

// 导出游戏实例用于测试
window.__game__ = game;