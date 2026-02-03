// 状态常量
const STATE = {
  IDLE: 'idle',
  WALK: 'walk',
  RUN: 'run'
};

const SPEED = {
  IDLE: 0,
  WALK: 300,
  RUN: 600
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentState = STATE.IDLE;
    this.player = null;
    this.stateText = null;
    this.speedText = null;
    this.directionX = 0;
    
    // 初始化信号对象
    window.__signals__ = {
      state: STATE.IDLE,
      speed: SPEED.IDLE,
      position: { x: 0, y: 0 },
      directionX: 0
    };
  }

  preload() {
    // 使用 Graphics 创建角色纹理
    const graphics = this.add.graphics();
    
    // 静止状态 - 蓝色矩形
    graphics.fillStyle(0x0000ff, 1);
    graphics.fillRect(0, 0, 40, 60);
    graphics.generateTexture('player_idle', 40, 60);
    graphics.clear();
    
    // 行走状态 - 绿色矩形
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 40, 60);
    graphics.generateTexture('player_walk', 40, 60);
    graphics.clear();
    
    // 跑步状态 - 红色矩形
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(0, 0, 40, 60);
    graphics.generateTexture('player_run', 40, 60);
    graphics.clear();
    
    graphics.destroy();
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x222222, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建地面
    const ground = this.add.graphics();
    ground.fillStyle(0x8B4513, 1);
    ground.fillRect(0, 550, 800, 50);

    // 创建物理角色
    this.player = this.physics.add.sprite(400, 500, 'player_idle');
    this.player.setCollideWorldBounds(true);
    this.player.body.setGravityY(0); // 不使用重力，手动控制

    // 创建状态显示文本
    this.stateText = this.add.text(20, 20, '', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.speedText = this.add.text(20, 60, '', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建操作说明
    this.add.text(20, 100, '按键说明:\n1 - 静止 (蓝色)\n2 - 行走 (绿色)\n3 - 跑步 (红色)\n方向键 ← → 移动', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 键盘输入
    this.input.keyboard.on('keydown-ONE', () => this.changeState(STATE.IDLE));
    this.input.keyboard.on('keydown-TWO', () => this.changeState(STATE.WALK));
    this.input.keyboard.on('keydown-THREE', () => this.changeState(STATE.RUN));

    // 方向键
    this.cursors = this.input.keyboard.createCursorKeys();

    // 初始化显示
    this.updateDisplay();

    // 输出初始状态到控制台
    console.log(JSON.stringify({
      event: 'game_start',
      state: this.currentState,
      speed: this.getCurrentSpeed()
    }));
  }

  changeState(newState) {
    if (this.currentState !== newState) {
      this.currentState = newState;
      
      // 更新角色纹理
      switch (newState) {
        case STATE.IDLE:
          this.player.setTexture('player_idle');
          break;
        case STATE.WALK:
          this.player.setTexture('player_walk');
          break;
        case STATE.RUN:
          this.player.setTexture('player_run');
          break;
      }
      
      this.updateDisplay();
      
      // 输出状态变化到控制台
      console.log(JSON.stringify({
        event: 'state_change',
        state: this.currentState,
        speed: this.getCurrentSpeed(),
        timestamp: Date.now()
      }));
    }
  }

  getCurrentSpeed() {
    switch (this.currentState) {
      case STATE.IDLE:
        return SPEED.IDLE;
      case STATE.WALK:
        return SPEED.WALK;
      case STATE.RUN:
        return SPEED.RUN;
      default:
        return 0;
    }
  }

  updateDisplay() {
    const speed = this.getCurrentSpeed();
    this.stateText.setText(`当前状态: ${this.getStateText()}`);
    this.speedText.setText(`速度: ${speed} px/s`);
    
    // 更新全局信号
    window.__signals__.state = this.currentState;
    window.__signals__.speed = speed;
  }

  getStateText() {
    switch (this.currentState) {
      case STATE.IDLE:
        return '静止 (IDLE)';
      case STATE.WALK:
        return '行走 (WALK)';
      case STATE.RUN:
        return '跑步 (RUN)';
      default:
        return '未知';
    }
  }

  update(time, delta) {
    // 检测方向键输入
    this.directionX = 0;
    
    if (this.cursors.left.isDown) {
      this.directionX = -1;
    } else if (this.cursors.right.isDown) {
      this.directionX = 1;
    }

    // 根据状态和方向设置速度
    const speed = this.getCurrentSpeed();
    this.player.setVelocityX(speed * this.directionX);

    // 更新全局信号
    window.__signals__.position = {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y)
    };
    window.__signals__.directionX = this.directionX;
    window.__signals__.actualVelocity = Math.round(this.player.body.velocity.x);
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

// 启动游戏
new Phaser.Game(config);