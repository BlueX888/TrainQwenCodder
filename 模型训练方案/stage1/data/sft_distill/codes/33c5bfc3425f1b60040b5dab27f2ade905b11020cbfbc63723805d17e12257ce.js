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

let player;
let currentState = 'idle';
let stateText;
let iKey, rKey;

function preload() {
  // 程序化生成角色纹理帧
  const graphics = this.add.graphics();
  
  // 生成 idle 状态的 3 帧（橙色角色，轻微变化）
  for (let i = 0; i < 3; i++) {
    graphics.clear();
    
    // 身体（橙色矩形）
    graphics.fillStyle(0xff8800, 1);
    graphics.fillRect(0, 10, 40, 50);
    
    // 头部（橙色圆形）
    graphics.fillStyle(0xff9933, 1);
    graphics.fillCircle(20, 10, 15);
    
    // 眼睛
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(15, 8, 3);
    graphics.fillCircle(25, 8, 3);
    
    // idle 状态：手臂轻微摆动
    const armOffset = Math.sin(i * Math.PI / 3) * 3;
    graphics.fillStyle(0xff8800, 1);
    graphics.fillRect(-5, 20 + armOffset, 10, 25); // 左臂
    graphics.fillRect(35, 20 - armOffset, 10, 25); // 右臂
    
    // 腿部（静止）
    graphics.fillRect(10, 60, 10, 20);
    graphics.fillRect(20, 60, 10, 20);
    
    graphics.generateTexture(`idle_${i}`, 50, 90);
  }
  
  // 生成 run 状态的 4 帧（橙色角色，动态跑步姿势）
  for (let i = 0; i < 4; i++) {
    graphics.clear();
    
    // 身体（橙色矩形，略微倾斜）
    graphics.fillStyle(0xff8800, 1);
    graphics.fillRect(0, 10, 40, 50);
    
    // 头部（橙色圆形）
    graphics.fillStyle(0xff9933, 1);
    graphics.fillCircle(20, 10, 15);
    
    // 眼睛
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(15, 8, 3);
    graphics.fillCircle(25, 8, 3);
    
    // run 状态：手臂大幅度摆动
    const armAngle = i * Math.PI / 2;
    const armOffset = Math.sin(armAngle) * 10;
    graphics.fillStyle(0xff8800, 1);
    graphics.fillRect(-5, 15 + armOffset, 10, 30); // 左臂
    graphics.fillRect(35, 15 - armOffset, 10, 30); // 右臂
    
    // 腿部（跑步动作）
    const legOffset = Math.cos(armAngle) * 15;
    graphics.fillRect(10, 60, 10, 20 + Math.abs(legOffset));
    graphics.fillRect(20, 60, 10, 20 + Math.abs(-legOffset));
    
    graphics.generateTexture(`run_${i}`, 50, 90);
  }
  
  graphics.destroy();
}

function create() {
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
  
  // 创建玩家精灵
  player = this.add.sprite(400, 400, 'idle_0');
  player.setScale(2);
  player.play('idle');
  
  // 状态文本显示
  stateText = this.add.text(400, 100, 'State: IDLE', {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 20, y: 10 }
  });
  stateText.setOrigin(0.5);
  
  // 提示文本
  this.add.text(400, 550, 'Press [I] for IDLE  |  Press [R] for RUN', {
    fontSize: '20px',
    fontFamily: 'Arial',
    color: '#aaaaaa'
  }).setOrigin(0.5);
  
  // 添加键盘输入
  iKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.I);
  rKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
  
  // 监听按键事件
  iKey.on('down', () => {
    switchState.call(this, 'idle');
  });
  
  rKey.on('down', () => {
    switchState.call(this, 'run');
  });
}

function switchState(newState) {
  if (currentState === newState) return;
  
  currentState = newState;
  
  // 停止所有 tween
  this.tweens.killTweensOf(player);
  
  if (newState === 'idle') {
    // 切换到 idle 状态
    player.play('idle');
    stateText.setText('State: IDLE');
    stateText.setColor('#00ff00');
    
    // idle 状态的 tween：轻微上下浮动
    this.tweens.add({
      targets: player,
      y: player.y - 10,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // 缩放回正常
    this.tweens.add({
      targets: player,
      scaleX: 2,
      scaleY: 2,
      duration: 300,
      ease: 'Back.easeOut'
    });
    
  } else if (newState === 'run') {
    // 切换到 run 状态
    player.play('run');
    stateText.setText('State: RUN');
    stateText.setColor('#ff8800');
    
    // run 状态的 tween：左右移动
    this.tweens.add({
      targets: player,
      x: 200,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Linear'
    });
    
    // 轻微放大
    this.tweens.add({
      targets: player,
      scaleX: 2.2,
      scaleY: 2.2,
      duration: 300,
      ease: 'Back.easeOut'
    });
    
    // 添加旋转效果
    this.tweens.add({
      targets: player,
      angle: { from: -5, to: 5 },
      duration: 200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
}

function update(time, delta) {
  // 可以在这里添加额外的更新逻辑
}

new Phaser.Game(config);