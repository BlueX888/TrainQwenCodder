// 蓝色角色状态切换游戏
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// 全局信号对象
window.__signals__ = {
  currentState: 'idle',
  stateChanges: [],
  frameCount: 0
};

function preload() {
  // 生成 idle 状态的纹理帧（3帧，蓝色角色站立）
  for (let i = 0; i < 3; i++) {
    const graphics = this.add.graphics();
    
    // 身体（蓝色矩形）
    graphics.fillStyle(0x4a90e2, 1);
    graphics.fillRect(16, 20 + i * 2, 48, 60);
    
    // 头部（深蓝色圆形）
    graphics.fillStyle(0x2e5c8a, 1);
    graphics.fillCircle(40, 20, 18);
    
    // 眼睛（白色）
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(35, 18, 4);
    graphics.fillCircle(45, 18, 4);
    
    // 瞳孔（黑色）
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(35, 18, 2);
    graphics.fillCircle(45, 18, 2);
    
    // 腿部（深蓝色矩形）
    graphics.fillStyle(0x2e5c8a, 1);
    graphics.fillRect(20, 80, 15, 20);
    graphics.fillRect(45, 80, 15, 20);
    
    graphics.generateTexture(`idle_${i}`, 80, 100);
    graphics.destroy();
  }
  
  // 生成 run 状态的纹理帧（4帧，蓝色角色跑步）
  for (let i = 0; i < 4; i++) {
    const graphics = this.add.graphics();
    const legOffset = i % 2 === 0 ? 5 : -5;
    
    // 身体（蓝色矩形，稍微前倾）
    graphics.fillStyle(0x4a90e2, 1);
    graphics.fillRect(16, 18, 48, 60);
    
    // 头部（深蓝色圆形）
    graphics.fillStyle(0x2e5c8a, 1);
    graphics.fillCircle(40, 18, 18);
    
    // 眼睛（白色，更有神）
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(36, 16, 5);
    graphics.fillCircle(46, 16, 5);
    
    // 瞳孔（黑色）
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(37, 16, 2);
    graphics.fillCircle(47, 16, 2);
    
    // 腿部（交替运动）
    graphics.fillStyle(0x2e5c8a, 1);
    graphics.fillRect(20, 78 + legOffset, 15, 22);
    graphics.fillRect(45, 78 - legOffset, 15, 22);
    
    // 手臂摆动
    graphics.fillStyle(0x4a90e2, 1);
    graphics.fillRect(10, 30 - legOffset, 8, 30);
    graphics.fillRect(62, 30 + legOffset, 8, 30);
    
    graphics.generateTexture(`run_${i}`, 80, 100);
    graphics.destroy();
  }
}

function create() {
  // 创建标题文本
  const title = this.add.text(400, 50, '角色状态切换', {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  title.setOrigin(0.5);
  
  // 创建提示文本
  const hint = this.add.text(400, 100, '按 I 键: Idle 状态 | 按 R 键: Run 状态', {
    fontSize: '20px',
    fontFamily: 'Arial',
    color: '#aaaaaa'
  });
  hint.setOrigin(0.5);
  
  // 创建状态显示文本
  this.stateText = this.add.text(400, 520, '当前状态: IDLE', {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#4a90e2',
    fontStyle: 'bold'
  });
  this.stateText.setOrigin(0.5);
  
  // 创建角色精灵
  this.player = this.add.sprite(400, 350, 'idle_0');
  this.player.setScale(2);
  
  // 创建 idle 动画
  this.anims.create({
    key: 'idle',
    frames: [
      { key: 'idle_0' },
      { key: 'idle_1' },
      { key: 'idle_2' },
      { key: 'idle_1' }
    ],
    frameRate: 4,
    repeat: -1
  });
  
  // 创建 run 动画
  this.anims.create({
    key: 'run',
    frames: [
      { key: 'run_0' },
      { key: 'run_1' },
      { key: 'run_2' },
      { key: 'run_3' }
    ],
    frameRate: 10,
    repeat: -1
  });
  
  // 初始化为 idle 状态
  this.currentState = 'idle';
  this.player.play('idle');
  
  // 创建 idle 状态的 tween（缓慢上下浮动）
  this.idleTween = this.tweens.add({
    targets: this.player,
    y: 340,
    duration: 1500,
    ease: 'Sine.easeInOut',
    yoyo: true,
    repeat: -1
  });
  
  // run 状态的 tween（初始为 null）
  this.runTween = null;
  
  // 添加键盘输入
  this.keyI = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
  this.keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
  
  // 监听按键按下事件
  this.keyI.on('down', () => {
    this.switchState('idle');
  });
  
  this.keyR.on('down', () => {
    this.switchState('run');
  });
  
  // 切换状态函数
  this.switchState = (newState) => {
    if (this.currentState === newState) return;
    
    this.currentState = newState;
    
    // 更新全局信号
    window.__signals__.currentState = newState;
    window.__signals__.stateChanges.push({
      state: newState,
      timestamp: Date.now(),
      frame: window.__signals__.frameCount
    });
    
    // 输出日志
    console.log(JSON.stringify({
      event: 'stateChange',
      state: newState,
      time: Date.now()
    }));
    
    // 更新状态文本
    this.stateText.setText(`当前状态: ${newState.toUpperCase()}`);
    this.stateText.setColor(newState === 'idle' ? '#4a90e2' : '#e24a4a');
    
    // 停止所有 tween
    if (this.idleTween) this.idleTween.stop();
    if (this.runTween) this.runTween.stop();
    
    if (newState === 'idle') {
      // 切换到 idle 动画
      this.player.play('idle');
      
      // 重置位置并启动 idle tween
      this.player.y = 350;
      this.player.x = 400;
      this.player.angle = 0;
      
      this.idleTween = this.tweens.add({
        targets: this.player,
        y: 340,
        duration: 1500,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
      });
      
    } else if (newState === 'run') {
      // 切换到 run 动画
      this.player.play('run');
      
      // 重置位置并启动 run tween（快速左右移动 + 轻微旋转）
      this.player.y = 350;
      this.player.x = 400;
      
      this.runTween = this.tweens.add({
        targets: this.player,
        x: 450,
        angle: 3,
        duration: 600,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
      });
      
      // 添加轻微的上下跳跃效果
      this.tweens.add({
        targets: this.player,
        y: 345,
        duration: 300,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
      });
    }
  };
  
  // 初始化信号
  window.__signals__.stateChanges.push({
    state: 'idle',
    timestamp: Date.now(),
    frame: 0
  });
}

function update() {
  // 更新帧计数
  window.__signals__.frameCount++;
}

// 启动游戏
new Phaser.Game(config);