class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    
    // 状态枚举
    this.STATE = {
      IDLE: 'IDLE',
      WALK: 'WALK',
      RUN: 'RUN'
    };
    
    // 状态对应速度
    this.SPEED_MAP = {
      IDLE: 0,
      WALK: 300,
      RUN: 600
    };
    
    this.currentState = this.STATE.IDLE;
    this.player = null;
    this.stateText = null;
    this.cursors = null;
    
    // 可验证的信号
    window.__signals__ = {
      state: this.STATE.IDLE,
      speed: 0,
      position: { x: 0, y: 0 },
      stateChanges: []
    };
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家角色（使用 Graphics 绘制矩形）
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 40, 60);
    graphics.generateTexture('player', 40, 60);
    graphics.destroy();
    
    // 创建玩家精灵
    this.player = this.add.sprite(400, 300, 'player');
    this.player.setOrigin(0.5, 0.5);
    
    // 创建状态显示文本
    this.stateText = this.add.text(20, 20, '', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 10 }
    });
    this.stateText.setDepth(100);
    
    // 创建说明文本
    const instructionText = this.add.text(20, 80, 
      'Press 1: IDLE (0 speed)\nPress 2: WALK (300 speed)\nPress 3: RUN (600 speed)\nArrow Keys: Move', 
      {
        fontSize: '16px',
        color: '#ffff00',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      }
    );
    
    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 状态切换键
    this.input.keyboard.on('keydown-ONE', () => this.changeState(this.STATE.IDLE));
    this.input.keyboard.on('keydown-TWO', () => this.changeState(this.STATE.WALK));
    this.input.keyboard.on('keydown-THREE', () => this.changeState(this.STATE.RUN));
    
    // 初始化显示
    this.updateStateDisplay();
    
    console.log(JSON.stringify({
      event: 'game_start',
      state: this.currentState,
      speed: this.SPEED_MAP[this.currentState]
    }));
  }

  changeState(newState) {
    const oldState = this.currentState;
    this.currentState = newState;
    
    // 记录状态变化
    const stateChange = {
      timestamp: Date.now(),
      from: oldState,
      to: newState,
      speed: this.SPEED_MAP[newState]
    };
    
    window.__signals__.stateChanges.push(stateChange);
    window.__signals__.state = newState;
    window.__signals__.speed = this.SPEED_MAP[newState];
    
    // 更新显示
    this.updateStateDisplay();
    
    // 输出日志
    console.log(JSON.stringify({
      event: 'state_change',
      ...stateChange
    }));
    
    // 根据状态改变角色颜色（视觉反馈）
    const colorMap = {
      IDLE: 0x888888,
      WALK: 0x00ff00,
      RUN: 0xff0000
    };
    
    this.player.setTint(colorMap[newState]);
  }

  updateStateDisplay() {
    const speed = this.SPEED_MAP[this.currentState];
    this.stateText.setText(
      `State: ${this.currentState}\nSpeed: ${speed}\nPosition: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`
    );
  }

  update(time, delta) {
    // 获取当前状态的速度
    const speed = this.SPEED_MAP[this.currentState];
    
    // 计算移动增量（考虑帧时间）
    const deltaSpeed = speed * (delta / 1000);
    
    // 移动逻辑
    let moved = false;
    
    if (this.cursors.left.isDown) {
      this.player.x -= deltaSpeed;
      moved = true;
    } else if (this.cursors.right.isDown) {
      this.player.x += deltaSpeed;
      moved = true;
    }
    
    if (this.cursors.up.isDown) {
      this.player.y -= deltaSpeed;
      moved = true;
    } else if (this.cursors.down.isDown) {
      this.player.y += deltaSpeed;
      moved = true;
    }
    
    // 边界检测
    this.player.x = Phaser.Math.Clamp(this.player.x, 20, 780);
    this.player.y = Phaser.Math.Clamp(this.player.y, 30, 570);
    
    // 更新显示和信号
    if (moved || time % 100 < delta) {
      this.updateStateDisplay();
      window.__signals__.position = {
        x: Math.round(this.player.x),
        y: Math.round(this.player.y)
      };
    }
    
    // 根据移动状态调整角色旋转（视觉效果）
    if (moved && speed > 0) {
      if (this.cursors.left.isDown) {
        this.player.setFlipX(true);
      } else if (this.cursors.right.isDown) {
        this.player.setFlipX(false);
      }
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene,
  parent: 'game-container'
};

const game = new Phaser.Game(config);

// 导出验证函数
window.getGameState = function() {
  return {
    currentState: window.__signals__.state,
    currentSpeed: window.__signals__.speed,
    position: window.__signals__.position,
    totalStateChanges: window.__signals__.stateChanges.length,
    stateHistory: window.__signals__.stateChanges
  };
};

console.log('Game initialized. Use window.getGameState() to check current state.');
console.log('Controls: 1=IDLE, 2=WALK, 3=RUN, Arrow Keys=Move');